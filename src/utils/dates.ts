const TokenExpiration = (num: number) => {
  return new Date(Date.now() + num * 60 * 1000);
};

const encodeExpiresAt = (dateString: string): string => {
  const result = new Date(dateString);
  return encodeURIComponent(result.toISOString());
};

export { TokenExpiration, encodeExpiresAt };
