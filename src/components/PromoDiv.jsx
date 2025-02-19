import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { FireExtinguisher, Notebook } from "lucide-react";

export const PromoDiv = (props) => {
  return (
    <Link to={props.eventLink}>
      <div className="shadow-2xl backdrop-blur-sm flex justify-center bg-black/20 rounded-lg mb-2">
        <div className="bg-black/40 border border-black/50 mr-[3px] flex align-middle rounded-l-lg px-1 py-1">
          <div className="my-auto ">
            {props.eventStatus == "done" ? (
              <FireExtinguisher size={28} color="white" />
            ) : (
              <Notebook size={28} color="white" />
            )}
          </div>
        </div>
        <div className="bg-black/40 border border-black/50 rounded-r-lg px-2 py-1 w-full">
          <h1 className="text-white text-lg leading-7 text-right">
            {props.eventName}
          </h1>
          <span className="flex justify-end items-center ">
            <p className="text-white text-left">View </p>
          </span>
        </div>
      </div>
    </Link>
  );
};

PromoDiv.propTypes = {
  eventLink: PropTypes.string.isRequired,
  eventName: PropTypes.string.isRequired,
  eventStatus: PropTypes.string.isRequired,
};
