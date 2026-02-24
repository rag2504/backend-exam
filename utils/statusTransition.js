const VALID_TRANSITIONS = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: []
};

function isValidTransition(oldStatus, newStatus) {
  return VALID_TRANSITIONS[oldStatus] && VALID_TRANSITIONS[oldStatus].includes(newStatus);
}

module.exports = { isValidTransition, VALID_TRANSITIONS };
