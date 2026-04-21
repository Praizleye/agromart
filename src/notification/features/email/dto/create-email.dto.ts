import z from 'zod';
export class CreateEmailDto {}

export const SendVerificationEmailType = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class sendVerifyUserEmailDto {
  email!: string;
  password!: string;

  constructor(data: z.infer<typeof SendVerificationEmailType>) {
    SendVerificationEmailType.parse(data);
    Object.assign(this, data);
  }
}
