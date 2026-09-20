// import React from "react";
// import { Link } from "react-router-dom";
// import PropTypes from "prop-types";
// import { FireExtinguisher, Notebook } from "lucide-react";

export const PromoDiv = (props) => {
  return (
    <Link to={props.eventLink} className="shrink-0">
      <div className="shadow-2xl backdrop-blur-sm flex justify-center bg-black/20 rounded-lg">
        <div className="bg-black/40 border border-black/50 mr-[3px] flex items-center rounded-l-lg px-1 py-1">
          <div className="my-auto">
            {props.eventStatus == "done" ? (
              <FireExtinguisher size={16} className="sm:w-[28px] sm:h-[28px]" color="white" />
            ) : (
              <Notebook size={14} className="sm:w-5 sm:h-5" color="white" />
            )}
          </div>
        </div>
        <div className="bg-black/40 border border-black/50 rounded-r-lg px-2 py-1 whitespace-nowrap sm:w-full">
          <h1 className="text-white text-[11px] sm:text-sm leading-4 sm:leading-5 text-right">
            {props.eventName}
          </h1>
          <span className="flex justify-end items-center">
            <p className="text-white text-[9px] sm:text-xs">View </p>
          </span>
        </div>
      </div>
    </Link>
  );
};

// PromoDiv.propTypes = {
//   eventLink: PropTypes.string.isRequired,
//   eventName: PropTypes.string.isRequired,
//   eventStatus: PropTypes.string.isRequired,
// };
