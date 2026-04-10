import FarewellPageTemplate from "./FarewellPageTemplate";

function PranathiFarewell() {
  return (
    <FarewellPageTemplate
      title="Pranathi"
      role="Core Team & Creative Soul"
      photoSrc="/teamImages/pranathi.png"
      subtitle="You painted our vision with brilliance. Your creative touch turned ordinary events into experiences that people still remember."
      juniorsComments={[
        {
          name: "Juniors",
          text: "Your creativity made us believe design and execution could both be beautiful.",
        },
        {
          name: "Creative Team",
          text: "Every design was a masterpiece—thank you for raising our standards.",
        },
        {
          name: "DQ",
          text: "Your legacy is in every beautiful moment you created for us.",
        },
      ]}
    />
  );
}

export default PranathiFarewell;
