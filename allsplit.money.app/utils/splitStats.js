import { findPersonByPhone } from "./userIdentity";

export const getMyOweForSplit = (split, userMobile) => {
  const myPersonId = findPersonByPhone(split?.people ?? [], userMobile)?.id;

  if (!myPersonId) {
    return 0;
  }

  return (split?.items ?? []).reduce((sum, billItem) => {
    const consumer = billItem?.consumption?.consumers?.find(
      (entry) => entry.person_id === myPersonId
    );
    return sum + (consumer?.amount || 0);
  }, 0);
};

export const getSplitTotal = (split) =>
  (split?.items ?? []).reduce(
    (sum, item) => sum + (parseFloat(item.total) || item.price * item.qty || 0),
    0
  );

export const getParticipantStatus = (split, userMobile) => {
  const myPerson = findPersonByPhone(split?.people ?? [], userMobile);
  if (myPerson?.status !== undefined) {
    return myPerson.status;
  }

  return (
    split?.people?.[0]?.status ??
    split?.consolidated?.participants?.[0]?.status
  );
};

export const isUserBillClosed = (split, userMobile) =>
  getParticipantStatus(split, userMobile) === "closed";

export const getPersonSettlement = (person) => {
  if (person?.status !== "closed") {
    return "open";
  }
  return person?.settlement || "pending";
};

export const getPersonOweForSplit = (split, personId) => {
  if (!personId) {
    return 0;
  }

  return (split?.items ?? []).reduce((sum, billItem) => {
    const consumer = billItem?.consumption?.consumers?.find(
      (entry) => entry.person_id === personId
    );
    return sum + (consumer?.amount || 0);
  }, 0);
};

export const isSplitCreator = (split, userMobile) => {
  const creatorMobile = split?.meta?.creator_mobile;
  if (!creatorMobile || !userMobile) {
    return false;
  }

  return findPersonByPhone([{ phone: creatorMobile }], userMobile) !== null;
};

export const countPendingSettlements = (split, userMobile) => {
  if (!isSplitCreator(split, userMobile)) {
    return 0;
  }

  return (split?.people ?? []).filter((person) => {
    if (findPersonByPhone([person], userMobile)) {
      return false;
    }
    return getPersonSettlement(person) === "pending";
  }).length;
};

export const getBillSettlementStatus = (split, userMobile) => {
  if (split?.bill_settlement_status) {
    return split.bill_settlement_status;
  }

  if (split?.meta?.bill_settlement_status) {
    return split.meta.bill_settlement_status;
  }

  const others = (split?.people ?? []).filter(
    (person) => !findPersonByPhone([person], userMobile)
  );

  if (!others.length) {
    return "fully_settled";
  }

  if (others.some((person) => person.status !== "closed")) {
    return others.some((person) => getPersonSettlement(person) === "pending")
      ? "awaiting_settlement"
      : "active";
  }

  if (others.every((person) => getPersonSettlement(person) === "settled")) {
    return "fully_settled";
  }

  return "awaiting_settlement";
};

export const isSplitOpen = (split, userMobile) =>
  !isUserBillClosed(split, userMobile);

export const summarizeSplits = (splits, userMobile) => {
  const openSplits = splits.filter((split) => isSplitOpen(split, userMobile));
  const totalYouOwe = splits.reduce(
    (sum, split) => sum + getMyOweForSplit(split, userMobile),
    0
  );
  const openYouOwe = openSplits.reduce(
    (sum, split) => sum + getMyOweForSplit(split, userMobile),
    0
  );

  return {
    totalSplits: splits.length,
    openSplits: openSplits.length,
    totalYouOwe,
    openYouOwe,
  };
};
