import bcrypt from "bcrypt";
import { Admin } from "../schemas/mongooseSchema/adminSchema.mjs";
export const initializeAdmin = async () => {
  try {
    const plainUsername = process.env.ADMIN_USERNAME;
    const plainPassword = process.env.ADMIN_PASSWORD;
    const plainSecret = process.env.ADMIN_SECRET;
    const plainAuth = process.env.ADMIN_AUTH;
    const newAdmin = {
      username: plainUsername,
      password: await bcrypt.hash(plainPassword, 12),
      secret: await bcrypt.hash(plainSecret, 12),
      auth: await bcrypt.hash(plainAuth, 12),
    };

    const adminAccount = await Admin.findOne({ username: newAdmin.username });
    if (!adminAccount) {
      console.log("new admin", newAdmin);
      const admin = new Admin(newAdmin);
      await admin.save();
    } else {
      if (
        !(await bcrypt.compare(plainPassword, adminAccount.password)) ||
        !(await bcrypt.compare(plainSecret, adminAccount.secret)) ||
        !(await bcrypt.compare(plainAuth, adminAccount.auth))
      ) {
        adminAccount.password = await bcrypt.hash(plainPassword, 12);
        adminAccount.secret = await bcrypt.hash(plainSecret, 12);
        adminAccount.auth = await bcrypt.hash(plainAuth, 12);
        await adminAccount.save();
      }
    }
  } catch (err) {
    console.log(err);
  }
};
