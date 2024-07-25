const TokenExpiration = (num: number) => {
  return new Date(Date.now() + num * 60 * 1000);
};

export { TokenExpiration };
