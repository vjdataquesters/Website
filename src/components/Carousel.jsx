import React from "react";
import "./Home.css";
import events from "../data/events";
// import { useState, useEffect } from "react";

function Carousel() {
  const carouselImages = [
    "/home-1.jpg",
    "/home-2.jpg",
    "/home-3.jpg",
    "/home-4.png",
    "/home-5.jpg",
    "/home-6.jpg",
  ];

  // to dynamically load 2nd image from event data.
  // const [carouselImages, setCarouselImages] = useState([]);
  // useEffect(() => {
  //   const recentYear = Object.keys(events.past)[0];
  //   const image = events.past[recentYear]
  //     .map((event) => event.pics[1] || null)
  //     .filter((image) => image)
  //     .slice(0, 6);
  //   setCarouselImages(image);
  // }, []);

  return (
    <div className="c-div">
      <div className="slider-carousel">
        <div className="slider-track">
          {carouselImages &&
            carouselImages.map((img, index) => (
              <div key={index} className="slide">
                <img
                  src={img}
                  alt="Carousel image"
                  draggable={false}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Carousel;
