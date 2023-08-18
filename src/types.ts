import { z } from "zod";

export const baseUrl = z.string().url();
export const username = z.string().nonempty("Username can not be empty");
export const password = z.string().nonempty("Password can not be empty");
export const Config = z.object({
  baseUrl,
  username,
  password,
});
export type Config = z.infer<typeof Config>;
