import FarewellPageTemplate from "./FarewellPageTemplate";

function AvinashFarewell() {
  return (
    <FarewellPageTemplate
      title="Avinash"
      role="Core Team"
      photoSrc="/teamImages/avinash.png"
      subtitle="Thank you for leading with calm confidence and showing us what commitment really looks like. Your journey will always inspire us."
      juniorsComments={[
        {
          name: "Juniors",
          text: "Your mentorship made every event less stressful and more meaningful.",
        },
        {
          name: "Design Team",
          text: "You never let quality slip, and that discipline changed all of us.",
        },
        {
          name: "DQ Family",
          text: "No farewell can reduce the impact you created here.",
        },
      ]}
    />
  );
}

export default AvinashFarewell;
