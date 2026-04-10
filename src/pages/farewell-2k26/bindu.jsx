import FarewellPageTemplate from "./FarewellPageTemplate";

function BinduFarewell() {
  return (
    <FarewellPageTemplate
      title="Bindu"
      role="Core Team & Heart of DQ"
      photoSrc="/teamImages/bindu.png"
      subtitle="In the chaos of organizing, you were the calm. In the pressure of excellence, you were our support. You made us feel valued every single day."
      juniorsComments={[
        {
          name: "Juniors",
          text: "You listened when we needed to be heard, guided when we needed direction.",
        },
        {
          name: "Team",
          text: "Your kindness made this journey unforgettable.",
        },
        {
          name: "DQ Family",
          text: "Thank you for making us feel like we belonged.",
        },
      ]}
    />
  );
}

export default BinduFarewell;
