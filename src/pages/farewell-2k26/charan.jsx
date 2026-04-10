import FarewellPageTemplate from "./FarewellPageTemplate";

function CharanFarewell() {
  return (
    <FarewellPageTemplate
      title="Charan"
      role="Core Team & Event Lead"
      photoSrc="/teamImages/charan.png"
      subtitle="Your energy was contagious, your commitment was visible in every detail. You made us all believe we could achieve more."
      juniorsComments={[
        {
          name: "Juniors",
          text: "You didn't just lead events, you made us feel part of something bigger.",
        },
        {
          name: "Team",
          text: "Your positivity made late nights feel like celebrations, not deadlines.",
        },
        {
          name: "DQ",
          text: "The impact you created will echo through our future events.",
        },
      ]}
    />
  );
}

export default CharanFarewell;
