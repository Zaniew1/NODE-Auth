import { newUserType } from "../utils/zodSchemas/registerSchema";
import { DatabaseInstance } from "../utils/helpers/database";
import { SmtpMailer } from "../../../NODE-Mailer/mailer";
import { PasswordManage } from "../utils/helpers/PasswordManage";
export const createUser = async (data: newUserType) => {
  // check if user exists
  // create user
  // create verification code
  // send mail with code
  // create session
  // sign access token & refresh
  // return user & token
  const { name, password, email, surname } = data as newUserType;

  const userByEmail = await DatabaseInstance.findBy("user", { email });
  if (userByEmail) {
  }
  const newPassword = await PasswordManage.hashPassword(password);
  // we send email with welcome Card component as welcome message
  // SmtpMailer.sendWelcome({ email, name });
  // we create user
  const user = await DatabaseInstance.create("user", { data: { name, surname, email, password: newPassword } });
};
