import axios from "axios";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { eventType, eventData } = req.body;

    if (eventType === "presentation-request") {
      response = await axios.put(
        process.env.NEXT_PUBLIC_PRESENTATION_PROCEED_ENDPOINT,
        {
          invitationId: eventData.invitationId,
          verifiableCredentials: [eventData.credentialsToPresent[0].data],
        }
      );
    }

    console.log(
      "EVENT SENT TO THE API: ",
      eventType,
      JSON.stringify(eventData)
    );

    if (!eventData.verified) {
      console.log("Not Verified :(");
      return;
    } else {
      openDoor(eventData);

      res.status(200).json("SUCCESS");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}

const openDoor = async (eventData) => {
  console.log(
    "****************************************************************"
  );
  console.log("verifierDID=", eventData.verifierDID);
  console.log("Verifier1", process.env.NEXT_PUBLIC_VERIFIER1);
  console.log("Verifier2", process.env.NEXT_PUBLIC_VERIFIER2);

  let endpoint;

  if (eventData.verifierDID === process.env.NEXT_PUBLIC_VERIFIER1) {
    endpoint = process.env.NEXT_PUBLIC_ENDPOINT1;
  } else if (eventData.verifierDID === process.env.NEXT_PUBLIC_VERIFIER2) {
    endpoint = process.env.NEXT_PUBLIC_ENDPOINT2;
  } else if (
    eventData.verifierDID === process.env.NEXT_PUBLIC_VERIFIER_DISCORD_BOT
  ) {
    endpoint = process.env.NEXT_PUBLIC_ENDPOINT3;
  } else {
    console.log("Verifier not found");
    return;
  }

  console.log("Endpoint: ", endpoint);
  console.log(
    "****************************************************************"
  );
  console.log("Opening door...", endpoint);
  try {
    const doorResponse = await axios.post(endpoint, { state: "open" });
    console.log("Door opened!");
    console.log("Door Response: ", doorResponse.data);
  } catch (error) {
    console.log("Error opening door: ", error);
  }
};
