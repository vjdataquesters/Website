import FarewellPageTemplate from "./FarewellPageTemplate";

function GaneshFarewell() {
  return (
    <FarewellPageTemplate
      title="Ganesh"
      role="Core Team & Operations"
      photoSrc="/teamImages/ganesh.png"
      subtitle="Behind every smooth event was your meticulous planning. You made the impossible look effortless, and that's the real skill."
      juniorsComments={[
        {
          name: "Juniors",
          text: "You taught us that great execution is invisible—it just works.",
        },
        {
          name: "Operations Team",
          text: "Your organization and foresight saved us countless times.",
        },
        {
          name: "DQ",
          text: "Thank you for being the backbone that kept us moving.",
        },
      ]}
    />
  );
}

export default GaneshFarewell;
