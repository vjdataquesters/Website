import FarewellPageTemplate from "./FarewellPageTemplate";

function HiteshFarewell() {
  return (
    <FarewellPageTemplate
      title="Hitesh"
      role="Core Team & Technical Lead"
      photoSrc="/teamImages/hitesh.png"
      subtitle="You built systems that made things possible. Your technical brilliance wasn't just code—it was freedom for us to dream bigger."
      juniorsComments={[
        {
          name: "Juniors",
          text: "You made technology accessible and showed us coding is an art.",
        },
        {
          name: "Builders",
          text: "Every feature you shipped gave us confidence.",
        },
        {
          name: "DQ",
          text: "Your legacy lives in every system you built for us.",
        },
      ]}
    />
  );
}

export default HiteshFarewell;
