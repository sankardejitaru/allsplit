import { Linking } from "react-native";
import { FEATURE_FLAGS } from "../constants/config";
import { showToast } from "../utils/toastService";
import { getPersonFullName } from "../utils/phoneUtils";

function buildInviteMessage({ splitName, totalAmount, creatorName }) {
  const amountText =
    totalAmount != null ? `Total: ₹${Number(totalAmount).toFixed(2)}. ` : "";
  const byText = creatorName ? `${creatorName} added you to ` : "You were added to ";
  return `${byText}a split "${splitName}" on AllSplit. ${amountText}Open the app to view your share.`;
}

function buildReminderMessage({ splitName, person, amount, creatorName }) {
  const name = getPersonFullName(person) || "there";
  const amountText = `₹${Number(amount || 0).toFixed(2)}`;
  const fromText = creatorName ? ` from ${creatorName}` : "";
  return `Hi ${name}, reminder${fromText} on AllSplit. You still owe ${amountText} on "${splitName}". Please open the app and close your share.`;
}

async function openWhatsAppMessage(phone, message) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) {
    return false;
  }

  const url = `whatsapp://send?phone=${digits}&text=${encodeURIComponent(message)}`;
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.log("WhatsApp open failed:", phone, error);
    return false;
  }
}

export async function sendPaymentReminder({
  splitName,
  person,
  amount,
  creatorName,
  silent = false,
}) {
  const message = buildReminderMessage({
    splitName,
    person,
    amount,
    creatorName,
  });
  const opened = await openWhatsAppMessage(person?.phone, message);

  if (!opened && !silent) {
    showToast(
      "danger",
      "Could not open WhatsApp",
      "Install WhatsApp or share the reminder another way."
    );
  }

  return { opened, message };
}

export async function sendPaymentReminders({
  splitName,
  people = [],
  amountsByPersonId = {},
  creatorName,
}) {
  if (!people.length) {
    return { attempted: 0, opened: 0 };
  }

  const first = people[0];
  const result = await sendPaymentReminder({
    splitName,
    person: first,
    amount: amountsByPersonId[first.id] ?? 0,
    creatorName,
  });

  if (result.opened && people.length > 1) {
    showToast(
      "info",
      "Reminders sent",
      `Opened WhatsApp for ${getPersonFullName(first)}. Repeat Remind for others.`
    );
  }

  return { attempted: people.length, opened: result.opened ? 1 : 0 };
}

export async function notifySplitParticipants({
  splitName,
  people = [],
  creatorMobile,
  totalAmount,
  creatorName,
  serverResult,
}) {
  const message = buildInviteMessage({ splitName, totalAmount, creatorName });
  const recipients = people.filter(
    (person) => person.phone && person.phone !== creatorMobile
  );

  if (!recipients.length) {
    return { attempted: 0, opened: 0 };
  }

  const serverSkipped = serverResult?.skipped === true;
  const channelsDisabled =
    !FEATURE_FLAGS.enableSms &&
    !FEATURE_FLAGS.enableWhatsapp &&
    !FEATURE_FLAGS.enablePush;

  if (channelsDisabled && serverSkipped) {
    
    showToast(
      "info",
      "Split saved",
      "SMS/WhatsApp alerts are off in settings. Participants can open the app when ready."
    );
    return { attempted: recipients.length, opened: 0, disabled: true };
  }

  if (!FEATURE_FLAGS.enableWhatsapp) {
    showToast(
      "info",
      "Split saved",
      `${recipients.length} participant(s) will be notified when WhatsApp is enabled.`
    );
    return { attempted: recipients.length, opened: 0 };
  }

  let opened = 0;
  for (const person of recipients.slice(0, 3)) {
    const openedChat = await openWhatsAppMessage(person.phone, message);
    if (openedChat) {
      opened += 1;
    }
  }

  if (opened > 0) {
    showToast("info", "Invites sent", `Opened WhatsApp for ${opened} contact(s).`);
  }

  return { attempted: recipients.length, opened };
}
