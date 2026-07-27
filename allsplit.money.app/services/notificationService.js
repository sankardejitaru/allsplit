import { Linking } from "react-native";
import { FEATURE_FLAGS } from "../constants/config";
import { showToast } from "../utils/toastService";

function buildInviteMessage({ splitName, totalAmount, creatorName }) {
  const amountText =
    totalAmount != null ? `Total: ₹${Number(totalAmount).toFixed(2)}. ` : "";
  const byText = creatorName ? `${creatorName} added you to ` : "You were added to ";
  return `${byText}a split "${splitName}" on AllSplit. ${amountText}Open the app to view your share.`;
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
    const phone = String(person.phone).replace(/\D/g, "");
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        opened += 1;
      }
    } catch (error) {
      console.log("WhatsApp invite failed:", person.phone, error);
    }
  }

  if (opened > 0) {
    showToast("info", "Invites sent", `Opened WhatsApp for ${opened} contact(s).`);
  }

  return { attempted: recipients.length, opened };
}
