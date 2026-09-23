import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { MyOweAdd, updateSplit } from "../../services/splitService";
import { notifySplitParticipants } from "../../services/notificationService";
import { showToast } from "../../utils/toastService";
import {
  ensureSelfInPeople,
  getSelfSplitPerson,
  getUserMobile,
} from "../../utils/userIdentity";
import {
  getPersonFullName,
  normalizeParticipantPhone,
  toSplitPerson,
} from "../../utils/phoneUtils";
import {
  buildSplitName,
  formatBillDateLabel,
  parseSplitName,
} from "../../utils/billName";
import { createBillDetailsStyles } from "../../styles";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useAppTheme } from "../../context/ThemeContext";
import { useBrandStatusBar } from "../../hooks/useBrandStatusBar";
import { useHardwareBack } from "../../hooks/useHardwareBack";
import { goBackOrNavigate, resetToScreen } from "../../utils/navigationHelpers";

function mapBillItemsForEditor(billItems = []) {
  return billItems.map((item) => ({
    id: item.id || Date.now().toString(),
    name: item.name || "Item",
    qty: Number(item.qty) || 0,
    price: Number(item.price) || 0,
    split:
      item.split ||
      (item.split_type === "equal" ? "equal" : "consumption"),
  }));
}

export default function BillDetailsScreen({ navigation,route }) {
  const styles = useThemedStyles(createBillDetailsStyles);
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  useBrandStatusBar();
  const isEditMode = route.params?.mode === "edit";
  const editBillId = route.params?.billId || route.params?.editBill?._id || "";
  const returnScreen = route.params?.returnScreen || (isEditMode ? "CreatedSplits" : "MyOwe");
  const [people, setPeople] = useState([]);
  const [items, setItems] = useState([]);
  const [billDateLabel, setBillDateLabel] = useState(formatBillDateLabel());
  const [billPromptName, setBillPromptName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editHydrated, setEditHydrated] = useState(!isEditMode);

  const handleLeaveDetails = useCallback(() => {
    goBackOrNavigate(navigation, { screen: returnScreen });
  }, [navigation, returnScreen]);

  useHardwareBack(
    useCallback(() => {
      handleLeaveDetails();
      return true;
    }, [handleLeaveDetails])
  );

  const split_name = buildSplitName(billDateLabel, billPromptName);

  useEffect(() => {
    if (!isEditMode || editHydrated) {
      return;
    }

    const bill = route.params?.editBill;
    if (!bill) {
      setEditHydrated(true);
      return;
    }

    let cancelled = false;
    const hydrateEdit = async () => {
      const selfPerson = await getSelfSplitPerson();
      if (cancelled) {
        return;
      }

      const mappedPeople = (bill.people || []).map((person) => ({
        ...toSplitPerson(person),
        phone: normalizeParticipantPhone(person.phone),
        source: person.source,
      }));

      setPeople(ensureSelfInPeople(mappedPeople, selfPerson));
      setItems(mapBillItemsForEditor(bill.items || []));

      const parsed = parseSplitName(bill.split_name || "");
      setBillDateLabel(parsed.dateLabel || formatBillDateLabel());
      setBillPromptName(parsed.promptName);
      setEditHydrated(true);
    };

    hydrateEdit();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, editHydrated, route.params?.editBill]);

  useEffect(() => {
    if (isEditMode && !editHydrated) {
      return;
    }

    let cancelled = false;

    const hydratePeople = async () => {
      const selfPerson = await getSelfSplitPerson();
      if (cancelled) {
        return;
      }

      const fromRoute = Array.isArray(route.params?.selectedPeople)
        ? route.params.selectedPeople.map((person) => ({
            ...toSplitPerson(person),
            phone: normalizeParticipantPhone(person.phone),
          }))
        : null;

      if (fromRoute) {
        setPeople(ensureSelfInPeople(fromRoute, selfPerson));
      } else if (!isEditMode) {
        setPeople(ensureSelfInPeople([], selfPerson));
      }
    };

    hydratePeople();

    return () => {
      cancelled = true;
    };
  }, [route.params?.selectedPeople, isEditMode, editHydrated]);

  useEffect(() => {
    if (route.params?.Items?.length) {
      setItems(route.params.Items);
    }
  }, [route.params?.Items]);

  useEffect(() => {
    if (isEditMode && !route.params?.selectedPeople && route.params?.editBill) {
      return;
    }

    if (route.params?.split_name) {
      const parsed = parseSplitName(route.params.split_name);
      setBillDateLabel(parsed.dateLabel || formatBillDateLabel());
      setBillPromptName(parsed.promptName);
      return;
    }

    if (!isEditMode) {
      setBillDateLabel((prev) => prev || formatBillDateLabel());
    }
  }, [route.params?.split_name, isEditMode, route.params?.selectedPeople, route.params?.editBill]);

  const addNewItem = () => {
  const newItem = {
    id: Date.now().toString(),
    name: `Item ${items.length + 1}`,
    qty: 1,
    price: 0,
    split: "equal",
  };

  setItems(prev => [...prev, newItem]);
};

  const updateItemText = (id, field, value) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, [field]: field === "name" ? String(value) || "" : value }
          : item
      )
    );
  };

  const updateItem = (id, field, value) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, [field]: field === "qty" || field === "price" ? Number(value) || 0 : value }
          : item
      )
    );
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

   const buildBillPayload = (creatorMobile = "", peopleList = people, existingMeta = null) => {
  const totalPeople = peopleList.length;

  return {
    split_name: String(split_name || "").trim(),
    bill_summary: {
      total_amount: totalAmount,
      total_items: items.length,
      total_people: totalPeople,
    },

    people: peopleList.map((p) => {
      const person = toSplitPerson(p);
      return {
        id: person.id,
        name: person.name,
        firstname: person.firstname,
        lastname: person.lastname,
        phone: normalizeParticipantPhone(person.phone),
        ...(person.status ? { status: person.status } : {}),
        ...(person.settlement ? { settlement: person.settlement } : {}),
      };
    }),
    meta: {
          created_at: existingMeta?.created_at || new Date().toISOString(),
          created_by: existingMeta?.created_by || 'mobile_app_ui',
          creator_mobile: creatorMobile
            ? normalizeParticipantPhone(creatorMobile)
            : existingMeta?.creator_mobile,
        },
    items: items.map(item => {
      if (item.split === "equal") {
        const perPersonQty = Number(
          (item.qty / totalPeople).toFixed(2)
        );

        return {
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          total: item.qty * item.price,
          split_type: "equal",

          consumption: {
            mode: "quantity",
            consumers: peopleList.map(p => ({
              person_id: p.id,
              qty: perPersonQty,
              unit_price: item.price,
              amount: Number((perPersonQty * item.price).toFixed(2)),
            })),
          },
        };
      }

      return {
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        total: item.qty * item.price,
        split_type: "consumption",

        consumption: {
          mode: "quantity",
          consumers: peopleList.map(p => ({
              person_id: p.id,
              qty: 0,
              unit_price: item.price,
              amount: 0,
            })),
        },
      };
    }),

    created_at: existingMeta?.created_at || new Date().toISOString(),
  };
};

  const handleFinalSubmit = async () => {
    if (saving) {
      return;
    }

    if (!String(split_name || "").trim()) {
      showToast("danger", "Bill name required", "Enter a name for this bill");
      return;
    }

    const selfPerson = await getSelfSplitPerson();
    const peopleWithSelf = ensureSelfInPeople(people, selfPerson);

    if (!peopleWithSelf.length) {
      showToast("danger", "Add people", "Select at least one person for this split");
      return;
    }

    if (!items.length) {
      showToast("danger", "Add items", "Add at least one bill item");
      return;
    }

    const creatorMobile = await getUserMobile();
    const existingMeta = route.params?.editBill?.meta || null;
    const payload = buildBillPayload(creatorMobile, peopleWithSelf, existingMeta);
    setPeople(peopleWithSelf);
    setSaving(true);

    try {
      if (isEditMode) {
        if (!editBillId) {
          showToast("danger", "Could not update", "Missing bill id");
          return;
        }

        const response = await updateSplit({
          id: editBillId,
          split_name: payload.split_name,
          people: payload.people,
          items: payload.items,
          bill_summary: payload.bill_summary,
          meta: payload.meta,
        });

        if (!response.success) {
          showToast(
            "danger",
            "Could not update",
            response.message || response.detail || "Try again"
          );
          return;
        }

        showToast("info", "Bill updated", "Your changes have been saved.");
        if (returnScreen === "ManageSettlement" && response.updated_doc) {
          navigation.navigate("ManageSettlement", {
            bill: response.updated_doc,
            userMobile: creatorMobile,
          });
        } else {
          goBackOrNavigate(navigation, { screen: returnScreen });
        }
        return;
      }

      const response = await MyOweAdd(payload);

      if (response.status) {
        await notifySplitParticipants({
          splitName: split_name,
          people: peopleWithSelf,
          creatorMobile,
          totalAmount: totalAmount,
          serverResult: response.notifications,
        });

        showToast("info", "Split created", "Your bill split has been saved.");
        resetToScreen(navigation, "MyOwe");
      } else {
        showToast("danger", "Could not save", response.message || "Try again");
      }
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TextInput
            style={styles.standardinput}
            keyboardType="default"
            value={String(item.name)}
            onChangeText={val => updateItemText(item.id, "name", val)}
          />

          <TouchableOpacity
            style={{ position: "absolute", top: 8, right: 8 }}
            onPress={() => {
              setItems(prev => prev.filter(i => i.id !== item.id));
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color="#888" />
          </TouchableOpacity>

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Qty</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(item.qty)}
            onChangeText={val => updateItem(item.id, "qty", val)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Price</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(item.price)}
            onChangeText={val => updateItem(item.id, "price", val)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Total</Text>
          <Text style={styles.total}>
            ₹ {item.qty * item.price}
          </Text>
        </View>
      </View>

      <View style={styles.splitRow}>
        <SplitButton
          styles={styles}
          label="Equally"
          active={item.split === "equal"}
          onPress={() => updateItem(item.id, "split", "equal")}
        />
        <SplitButton
          styles={styles}
          label="By Consumption"
          active={item.split === "consumption"}
          onPress={() => updateItem(item.id, "split", "consumption")}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.statusBarFill, { height: insets.top }]} />
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
          <View style={{ flex: 1 }}>
            {isEditMode ? (
              <Text style={styles.billNameLabel}>Edit bill</Text>
            ) : null}
            <Text style={styles.amount}>₹ {totalAmount.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.addItemBtn, { marginLeft: "auto" }]}
            onPress={addNewItem}
          >
            <MaterialCommunityIcons name="plus" size={30} color="white" />
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 14 }}>
          <Text style={styles.billNameLabel}>Bill name</Text>
          <View style={styles.dateChip}>
            <Text style={styles.dateChipText}>{billDateLabel}</Text>
          </View>
          <TextInput
            style={styles.splitinput}
            value={billPromptName}
            onChangeText={setBillPromptName}
            placeholder="What is this for? (Dinner, Uber, Rent)"
            placeholderTextColor={colors.textMuted}
            maxLength={80}
          />
          <Text style={styles.billNameHint}>Saved as {split_name}</Text>
        </View>
      </View>

      <View style={styles.addPeopleContainer}>
        <Text style={styles.sectionLabel}>Add people</Text>
        <View style={styles.peopleRow}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() =>
              navigation.navigate("People", {
                selectedPeople: people,
                Items: items,
                split_name: split_name,
                mode: isEditMode ? "edit" : undefined,
                billId: editBillId || undefined,
                editBill: route.params?.editBill,
                returnScreen,
              })
            }
          >
            <Text style={styles.plus}>+</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.participantsStrip}
            style={styles.participantsStripWrap}
          >
            {people.map((item) => {
              const fullName = getPersonFullName(item) || "Unknown";
              const label =
                item.source === "self" ? `${fullName} (You)` : fullName;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.participantChip,
                    item.source === "self"
                      ? styles.chip_self
                      : styles.chip_open,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      item.source === "self"
                        ? styles.dot_self
                        : styles.dot_open,
                    ]}
                  />
                  <Text style={styles.chipName} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <TouchableOpacity
  style={[
    styles.proceedBtn,
    { bottom: Math.max(insets.bottom, 16) + 16 },
    saving && { opacity: 0.7 },
  ]}
  onPress={handleFinalSubmit}
  disabled={saving}
>
  <MaterialCommunityIcons
    name={isEditMode ? "content-save" : "chevron-right"}
    size={30}
    color="white"
  />
</TouchableOpacity>
    </View>
  );
}

function SplitButton({ styles, label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.splitBtn,
        active && styles.splitBtnActive,
      ]}
    >
      <Text style={[styles.splitText, active && styles.splitTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
