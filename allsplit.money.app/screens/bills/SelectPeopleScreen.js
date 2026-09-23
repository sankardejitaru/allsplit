import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Contacts from "react-native-contacts";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getContact, addnewcontact } from "../../services/contactService";
import { showToast } from "../../utils/toastService";
import { createSelectPeopleStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useThemedStatusBar } from "../../hooks/useThemedStatusBar";
import { useAppTheme } from "../../context/ThemeContext";
import { useHardwareBack } from "../../hooks/useHardwareBack";
import { goBackOrNavigate } from "../../utils/navigationHelpers";
import {
  formatPhoneDisplay,
  getContactInitials,
  normalizeDbContact,
  normalizeDeviceContact,
  normalizePerson,
  matchesContactSearch,
  filterDeviceContactsExcludingSaved,
} from "../../utils/phoneUtils";
import {
  ensureSelfInPeople,
  getSelfSplitPerson,
  phonesMatch,
} from "../../utils/userIdentity";
import { ensureSelfSavedContact } from "../../services/contactService";

const TABS = [
  { id: "saved", label: "Saved" },
  { id: "device", label: "Device" },
];

export default function SelectPeopleScreen({ navigation, route }) {
  const styles = useThemedStyles(createSelectPeopleStyles);
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  useThemedStatusBar();
  const [activeTab, setActiveTab] = useState("saved");
  const [savedContacts, setSavedContacts] = useState([]);
  const [deviceContacts, setDeviceContacts] = useState([]);
  const [deviceLoaded, setDeviceLoaded] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [loadingDevice, setLoadingDevice] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPeople, setSelectedPeople] = useState(
    (route.params?.selectedPeople || []).map(normalizePerson).filter((p) => p.phone)
  );
  const [splitName] = useState(route.params?.split_name || "");
  const [items] = useState(route.params?.Items || []);
  const [selfPerson, setSelfPerson] = useState(null);
  const editMode = route.params?.mode === "edit";
  const editBillId = route.params?.billId;
  const editBill = route.params?.editBill;
  const returnScreen = route.params?.returnScreen;

  const detailsParams = useCallback(
    (peopleList) => ({
      selectedPeople: peopleList,
      Items: items,
      split_name: splitName,
      ...(editMode
        ? {
            mode: "edit",
            billId: editBillId,
            editBill,
            returnScreen,
          }
        : {}),
    }),
    [items, splitName, editMode, editBillId, editBill, returnScreen]
  );

  useEffect(() => {
    loadSavedContacts();
    loadDeviceContacts();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const seedSelf = async () => {
      const self = await getSelfSplitPerson();
      if (cancelled || !self) {
        return;
      }

      setSelfPerson(self);
      setSelectedPeople((prev) => ensureSelfInPeople(prev, self));

      try {
        await ensureSelfSavedContact(self.phone, self.firstname, self.lastname);
        await loadSavedContacts();
      } catch (error) {
        console.log("Ensure self contact error:", error);
      }
    };

    seedSelf();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const scanned = route.params?.scannedPerson;
    if (!scanned) {
      return;
    }

    const normalized = normalizePerson(scanned);
    if (normalized?.phone) {
      setSelectedPeople((prev) =>
        prev.some(
          (entry) =>
            entry.id === normalized.id || entry.phone === normalized.phone
        )
          ? prev
          : [...prev, normalized]
      );
      setSavedContacts((prev) => {
        if (prev.some((entry) => String(entry._id) === String(normalized.id))) {
          return prev;
        }
        return [
          {
            _id: normalized.id,
            firstname: normalized.firstname,
            lastname: normalized.lastname,
            phone: normalized.phone,
          },
          ...prev,
        ];
      });
      setActiveTab("saved");
      showToast("info", "Contact added", normalized.name);
    }

    navigation.setParams({ scannedPerson: undefined });
  }, [route.params?.scannedPerson, navigation]);

  const requestContactsPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: "Contacts permission",
          message: "AllSplit needs access to your contacts to add people to a split.",
          buttonPositive: "Allow",
          buttonNegative: "Cancel",
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return false;
      }
    }

    const permission = await Contacts.checkPermission();
    if (permission === "authorized") {
      return true;
    }

    const requested = await Contacts.requestPermission();
    return requested === "authorized";
  };

  const loadSavedContacts = async () => {
    try {
      setLoadingSaved(true);
      const response = await getContact();
      const list = (response.contacts || []).filter((entry) => entry.phone);
      setSavedContacts(list);
    } catch (error) {
      console.error("Saved contacts error:", error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const loadDeviceContacts = async (force = false) => {
    if (deviceLoaded && !force) {
      return;
    }

    try {
      setLoadingDevice(true);

      const hasPermission = await requestContactsPermission();
      if (!hasPermission) {
        showToast("danger", "Permission needed", "Allow contacts access to import from device");
        return;
      }

      const contacts = await Contacts.getAll();
      const withPhone = contacts
        .filter((contact) => contact.phoneNumbers?.length > 0)
        .map((contact) => normalizeDeviceContact(contact))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

      setDeviceContacts(withPhone);
      setDeviceLoaded(true);
    } catch (error) {
      console.error("Device contacts error:", error);
      showToast("danger", "Could not load contacts", "Try again or use saved contacts");
    } finally {
      setLoadingDevice(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearch("");
    if (tabId === "device" && !deviceLoaded) {
      loadDeviceContacts();
    }
  };

  const displayedPeople = useMemo(() => {
    const source =
      activeTab === "device"
        ? filterDeviceContactsExcludingSaved(deviceContacts, savedContacts)
        : savedContacts.map(normalizeDbContact).filter(Boolean);

    return source.filter((person) => matchesContactSearch(person, search));
  }, [activeTab, deviceContacts, savedContacts, search]);

  const togglePerson = (person) => {
    const normalized = normalizePerson(person);
    if (!normalized.phone) {
      return;
    }

    if (selfPerson && phonesMatch(normalized.phone, selfPerson.phone)) {
      showToast("info", "You stay on the bill", "Your contact is included by default");
      return;
    }

    setSelectedPeople((prev) =>
      prev.some(
        (entry) =>
          entry.id === normalized.id || phonesMatch(entry.phone, normalized.phone)
      )
        ? prev.filter(
            (entry) =>
              entry.id !== normalized.id &&
              !phonesMatch(entry.phone, normalized.phone)
          )
        : [...prev, normalized]
    );
  };

  const handleAddContact = async () => {
    if (!firstname || !lastname || !phone) {
      showToast("danger", "Missing details", "All fields are required");
      return;
    }

    const payload = { firstname, lastname, phone };

    try {
      const response = await addnewcontact(payload);
      if (response.success) {
        showToast("info", "Contact saved", "Added to your saved contacts");
        setFirstname("");
        setLastname("");
        setPhone("");
        setShowAddModal(false);
        setSavedContacts((response.contacts || []).filter((entry) => entry.phone));
        setActiveTab("saved");
      }
    } catch (error) {
      console.error("Add contact error:", error);
    }
  };

  const handleBack = useCallback(() => {
    goBackOrNavigate(navigation, {
      screen: "Details",
      params: detailsParams(ensureSelfInPeople(selectedPeople, selfPerson)),
    });
  }, [navigation, selectedPeople, selfPerson, detailsParams]);

  useHardwareBack(
    useCallback(() => {
      if (showAddModal) {
        setShowAddModal(false);
        return true;
      }
      handleBack();
      return true;
    }, [showAddModal, handleBack])
  );

  const handleDone = () => {
    const withSelf = ensureSelfInPeople(
      selectedPeople.map(normalizePerson).filter((p) => p.phone),
      selfPerson
    );

    if (withSelf.length === 0) {
      showToast("danger", "Select people", "Choose at least one person for this split");
      return;
    }

    navigation.navigate("Details", detailsParams(withSelf));
  };

  const renderPerson = ({ item }) => {
    const isSelf = selfPerson && phonesMatch(item.phone, selfPerson.phone);
    const isSelected =
      isSelf ||
      selectedPeople.some(
        (entry) =>
          entry.id === item.id || phonesMatch(entry.phone, item.phone)
      );

    return (
      <TouchableOpacity
        style={[styles.row, isSelected && styles.rowSelected]}
        onPress={() => togglePerson(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getContactInitials(item)}</Text>
        </View>

        <View style={styles.personInfo}>
          <Text style={styles.name}>
            {isSelf ? `${item.name} (You)` : item.name}
          </Text>
          <Text style={styles.phone}>{formatPhoneDisplay(item.phone)}</Text>
        </View>

        <Ionicons
          name={isSelected ? "checkmark-circle" : "ellipse-outline"}
          size={22}
          color={isSelected ? colors.primary : colors.border}
        />
      </TouchableOpacity>
    );
  };

  const isLoading = activeTab === "saved" ? loadingSaved : loadingDevice;

  return (
    <View style={styles.safeArea}>
      <View style={[styles.statusBarFill, { height: insets.top }]} />
      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Choose people</Text>
          <Text style={styles.subtitle}>{selectedPeople.length} selected</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            navigation.navigate("ScanContact", {
              returnTo: "People",
              returnParams: {
                selectedPeople,
                Items: items,
                split_name: splitName,
                ...(editMode
                  ? {
                      mode: "edit",
                      billId: editBillId,
                      editBill,
                      returnScreen,
                    }
                  : {}),
              },
            })
          }
        >
          <Ionicons name="qr-code-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addBtn, styles.addBtnSpacer]} onPress={() => setShowAddModal(true)}>
          <Ionicons name="person-add-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => handleTabChange(tab.id)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={activeTab === "device" ? "Search device contacts" : "Search saved contacts"}
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          style={styles.list}
          data={displayedPeople}
          keyExtractor={(item) => item.id}
          renderItem={renderPerson}
          extraData={search}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {activeTab === "device"
                ? "No device contacts found. Try saved contacts or add manually."
                : "No saved contacts yet. Add one with the + button."}
            </Text>
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBackBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.footerBackText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      </View>

      <Modal
        transparent
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView edges={["bottom"]} style={styles.modalSafeArea}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add contact</Text>

            <TextInput
              style={styles.modalInput}
              value={firstname}
              placeholder="First name"
              placeholderTextColor={colors.textMuted}
              onChangeText={setFirstname}
            />
            <TextInput
              style={styles.modalInput}
              value={lastname}
              placeholder="Last name"
              placeholderTextColor={colors.textMuted}
              onChangeText={setLastname}
            />
            <TextInput
              style={styles.modalInput}
              value={phone}
              placeholder="Phone number"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              onChangeText={setPhone}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleAddContact}>
                <Text style={styles.modalSaveText}>Save contact</Text>
              </TouchableOpacity>
            </View>
          </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
