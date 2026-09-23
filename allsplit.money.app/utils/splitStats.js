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

export const isShareReopened = (person) =>
  Boolean(person?.reopened_at) && person?.status !== "closed";

export const isUserShareReopened = (split, userMobile) => {
  const person = findPersonByPhone(split?.people ?? [], userMobile);
  return isShareReopened(person);
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

export const canCreatorReopenShare = (split, userMobile, person) => {
  if (!isSplitCreator(split, userMobile) || !person) {
    return false;
  }

  if (findPersonByPhone([person], userMobile)) {
    return false;
  }

  return person.status === "closed";
};

export const canCreatorMarkReceived = (split, userMobile, person) => {
  if (!isSplitCreator(split, userMobile) || !person) {
    return false;
  }

  if (findPersonByPhone([person], userMobile)) {
    return false;
  }

  return getPersonSettlement(person) === "pending";
};

export const canCreatorEditBill = (split, userMobile) => {
  if (!isSplitCreator(split, userMobile)) {
    return false;
  }

  const others = (split?.people ?? []).filter(
    (person) => !findPersonByPhone([person], userMobile)
  );

  return others.every((person) => {
    if (person?.status === "closed") {
      return false;
    }
    const settlement = getPersonSettlement(person);
    return settlement === "open";
  });
};

export const haveAllOthersClosedShare = (split, userMobile) => {
  const others = (split?.people ?? []).filter(
    (person) => !findPersonByPhone([person], userMobile)
  );

  if (others.length === 0) {
    return true;
  }

  return others.every((person) => person.status === "closed");
};

export const canCreatorRemind = (split, userMobile, person) => {
  if (!isSplitCreator(split, userMobile) || !person) {
    return false;
  }

  if (findPersonByPhone([person], userMobile)) {
    return false;
  }

  return getPersonSettlement(person) !== "settled";
};

export const getRemindablePeople = (split, userMobile) =>
  (split?.people ?? []).filter((person) =>
    canCreatorRemind(split, userMobile, person)
  );

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

function roundMoney(amount) {
  return Number((amount || 0).toFixed(2));
}

/**
 * Creator collection summary for a bill (amounts from other participants only).
 * netDue = pending + open (still to collect from others).
 */
export const getCreatorNetDueSummary = (split, userMobile) => {
  const others = (split?.people ?? []).filter(
    (person) => !findPersonByPhone([person], userMobile)
  );

  let pending = 0;
  let received = 0;
  let open = 0;

  for (const person of others) {
    const amount = getPersonOweForSplit(split, person.id);
    const settlement = getPersonSettlement(person);

    if (settlement === "open") {
      open += amount;
    } else if (settlement === "pending") {
      pending += amount;
    } else if (settlement === "settled") {
      received += amount;
    }
  }

  pending = roundMoney(pending);
  received = roundMoney(received);
  open = roundMoney(open);

  return {
    pending,
    received,
    open,
    netDue: roundMoney(pending + open),
    totalFromOthers: roundMoney(pending + received + open),
  };
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

export const summarizeCreatedSplits = (splits, userMobile) => {
  let youAreOwed = 0;
  let pendingConfirmations = 0;
  let activeCollections = 0;

  for (const split of splits || []) {
    const net = getCreatorNetDueSummary(split, userMobile);
    youAreOwed += net.netDue;
    pendingConfirmations += countPendingSettlements(split, userMobile);
    if (getBillSettlementStatus(split, userMobile) !== "fully_settled") {
      activeCollections += 1;
    }
  }

  return {
    youAreOwed: Number(youAreOwed.toFixed(2)),
    pendingConfirmations,
    activeCollections,
  };
};

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
