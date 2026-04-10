import FarewellPageTemplate from "./FarewellPageTemplate";

function AdithyaFarewell() {
  return (
    <FarewellPageTemplate
      title="Adithya"
      role="Core Team & Visionary"
      photoSrc="/teamImages/adithya.png"
      subtitle="You saw what could be when others saw what was. Your creativity pushed us beyond boundaries we didn't know existed."
      juniorsComments={[
        {
          name: "Juniors",
          text: "You showed us that impossible is just a lack of imagination.",
        },
        {
          name: "Creative Team",
          text: "Your ideas made us feel like we were part of something extraordinary.",
        },
        {
          name: "DQ",
          text: "Thank you for believing in us before we believed in ourselves.",
        },
      ]}
    />
  );
}

export default AdithyaFarewell;
