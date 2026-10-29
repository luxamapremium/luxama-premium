
// get zoom access token
export async function getZoomAccessToken() {
  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  const data = await response.json();
  if (!response.ok) throw new Error("Zoom Auth Failed");
  return data.access_token
}


// create zoom meeting for a specific user
export async function createZoomMeeting(
  topic: string,
  startTime: Date,
  duration: number,
) {
  const token = await getZoomAccessToken();

  const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic,
      type: 2,
      start_time: startTime.toISOString(),
      duration,
      settings: {
        waiting_room: true,
        join_before_host: false, // User stays in waiting room until admin joins
        host_video: true,
        participant_video: true,
      },
    }),
  });

  const data = await response.json();
  return {
    joinUrl: data.join_url, // For the User
    startUrl: data.start_url, // For the Admin (Host)
    meetingId: data.id,
  };
}





// /**
//  * Retrieves an access token using Server-to-Server OAuth.
//  * This token allows the app to act on behalf of the account.
//  */
// export async function getZoomAccessToken() {
//   const credentials = Buffer.from(
//     `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`,
//   ).toString("base64");

//   const response = await fetch(
//     `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Basic ${credentials}`,
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     },
//   );

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(`Zoom Auth Failed: ${data.reason || response.statusText}`);
//   }

//   return data.access_token;
// }

// /**
//  * Creates a Zoom meeting for a specific host (Admin).
//  * @param topic - The title of the meeting.
//  * @param startTime - Date object for the meeting start.
//  * @param duration - Duration in minutes.
//  * @param adminEmail - The Zoom email address of the specific admin being booked.
//  */
// export async function createZoomMeeting(
//   topic: string,
//   startTime: Date,
//   duration: number,
//   adminEmail: string, // Critical for multi-admin support
// ) {
//   const token = await getZoomAccessToken();

//   // We use the dynamic adminEmail instead of "me" to ensure the
//   // correct admin owns the meeting and can sign in to start it.
//   const response = await fetch(
//     `https://api.zoom.us/v2/users/${adminEmail}/meetings`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         topic,
//         type: 2, // Scheduled Meeting
//         start_time: startTime.toISOString(),
//         duration,
//         settings: {
//           waiting_room: true,
//           join_before_host: false, // Prevents meeting from starting without the admin
//           host_video: true,
//           participant_video: true,
//           mute_upon_entry: true,
//           enforce_login: false, // Allows clients to join easily
//         },
//       }),
//     },
//   );

//   const data = await response.json();

//   if (!response.ok) {
//     console.error("Zoom API Error Details:", data);
//     throw new Error(
//       data.message ||
//         `Failed to create meeting for ${adminEmail}. Ensure they are a user in your Zoom account.`,
//     );
//   }

//   return {
//     joinUrl: data.join_url, // Send this to the Client
//     startUrl: data.start_url, // Send this to the Admin/Host
//     meetingId: data.id, // Store in your MongoDB booking document
//   };
// }
