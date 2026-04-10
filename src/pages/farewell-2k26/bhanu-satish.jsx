import FarewellPageTemplate from "./FarewellPageTemplate";

function BhanuSatishFarewell() {
  return (
    <FarewellPageTemplate
      title="Bhanu Satish"
      role="Core Team & Strategist"
      photoSrc="/teamImages/bhanu.png"
      subtitle="Your vision shaped what we became. Every strategic decision, every pivot—your fingerprints are all over our success."
      juniorsComments={[
        {
          name: "Juniors",
          text: "You challenged us to think bigger, not just do bigger.",
        },
        {
          name: "Leadership",
          text: "Your clarity during chaos was our anchor.",
        },
        {
          name: "DQ",
          text: "You taught us that leadership is about creating more leaders.",
        },
      ]}
    />
  );
}

export default BhanuSatishFarewell;
