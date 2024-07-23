const TokenExpiresInFifteenMinutes = () => {
  return new Date(Date.now() + 15 * 60 * 1000);
  // .toISOString();
};

export { TokenExpiresInFifteenMinutes };
