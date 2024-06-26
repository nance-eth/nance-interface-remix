import * as z from "zod";

export const stringAsNonNegativeNumber = z.string().transform((val, ctx) => {
  const parsed = parseInt(val);
  if (isNaN(parsed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Not a number",
    });

    return z.NEVER;
  } else if (parsed < 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Can't be less than 0",
    });

    return z.NEVER;
  }
  return parsed;
});

export const stringAsNonNegativeBigInt = z.string().transform((val, ctx) => {
  try {
    const parsed = BigInt(val);
    if (parsed < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Can't be less than 0",
      });

      return z.NEVER;
    }
    return parsed;
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Not a bigint",
    });

    return z.NEVER;
  }
});
