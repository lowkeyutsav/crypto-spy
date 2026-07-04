import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
) => {
  const equals = await bcrypt.compare(password, hashedPassword);
  return equals;
};
