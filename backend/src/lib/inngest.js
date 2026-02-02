// import { Inngest } from "inngest";
// import User from "../models/User.js";

// export const inngest = new Inngest({
//   id: "talent-iq",
// });

// const syncUser = inngest.createFunction(
//   { id: "sync-user" },
//   { event: "clerk/user.created" },
//   async ({ event }) => {
//     const { id, email_addresses, first_name, last_name, image_url } = event.data;

//     await User.create({
//       clerkId: id,
//       email: email_addresses[0]?.email_address,
//       name: `${first_name || ""} ${last_name || ""}`.trim(),
//       profileImage: image_url,
//     });
//   }
// );

// const deleteUserFromDB = inngest.createFunction(
//   { id: "delete-user-from-db" },
//   { event: "clerk/user.deleted" },
//   async ({ event }) => {
//     await User.deleteOne({ clerkId: event.data.id });
//   }
// );

// export const functions = [syncUser, deleteUserFromDB];



import { Inngest } from "inngest";
import User from "../models/User.js";

export const inngest = new Inngest({
  id: "talent-iq",
});

/**
 * Sync user to MongoDB when Clerk user is created
 */
const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const {
      id,
      email_addresses,
      first_name,
      last_name,
      image_url,
    } = event.data;

    await User.create({
      clerkId: id,
      email: email_addresses?.[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      profileImage: image_url,
    });
  }
);

/**
 * Delete user from MongoDB when Clerk user is deleted
 */
const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await User.deleteOne({ clerkId: event.data.id });
  }
);

export const functions = [syncUser, deleteUserFromDB];
