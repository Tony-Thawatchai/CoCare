// ROUTER FUNCTION===========

const signup_button = document.querySelector("#signup");
signup_button.addEventListener("click", (evt) => {
  evt.preventDefault();
  window.location.href = window.location.href + "signup";
});

const signin_button = document.querySelector("#signin");
signin_button.addEventListener("click", (evt) => {
  evt.preventDefault();
  window.location.href = window.location.href + "signin";
});

// IMG SLIDER=======
let i = 2;
// function loop(i) {
   let a=  setInterval(() => {
    if (i > 1 && i < 4) {
      let imgSlideActive = document.getElementById(`imgSlide${i}`);
      imgSlideActive.classList.add("img-slide-active");
      console.log(i);
      console.log(`${i}=active`);
      // let navSlideActive = document.getElementById(`sliderNav${i}`);
      // navSlideActive.classList.add("slider-active");
      let textSlideActive = document.getElementById(`textSlider${i}`);
      textSlideActive.classList.add("textSliderActive");
      let imgSlideNonActive1 = document.getElementById(`imgSlide${i - 1}`);
      imgSlideNonActive1.classList.remove("img-slide-active");
      // let navSlideNonActive = document.getElementById(`sliderNav${i - 1}`);
      // navSlideNonActive.classList.remove("slider-active");
      let textSlideNonActive = document.getElementById(`textSlider${i - 1}`);
      textSlideNonActive.classList.remove("textSliderActive");
      console.log(`${i - 1}=Inactive`);
    }

    if (i == 4) {
      let imgSlideNonActive2 = document.getElementById(`imgSlide${i - 1}`);
      imgSlideNonActive2.classList.remove("img-slide-active");
      // let navSlideNonActive2 = document.getElementById(`sliderNav${i - 1}`);
      // navSlideNonActive2.classList.remove("slider-active");
      let textSlideNonActive = document.getElementById(`textSlider${i - 1}`);
      textSlideNonActive.classList.remove("textSliderActive");
      console.log(`${i - 1}=Inactive`);
      i = 1;
      let imgSlideActive = document.getElementById(`imgSlide${i}`);
      imgSlideActive.classList.add("img-slide-active");
      console.log(i);
      console.log(`${i}=active`);
      // let navSlideActive = document.getElementById(`sliderNav${i}`);
      // navSlideActive.classList.add("slider-active");
      let textSlideActive = document.getElementById(`textSlider${i}`);
      textSlideActive.classList.add("textSliderActive");
    }
    i++;
  }, 3000);
  

// make new loop run at position of the click

// function clearLoop(){
//     clearInterval(a);
//     console.log(`clearInterval is called`)
// }
// sliderBtn1.addEventListener("click", () => {
//     clearLoop()
//   i = 1;
//   let a=  setInterval(() => {
//     if (i > 1 && i < 4) {
//       let imgSlideActive = document.getElementById(`imgSlide${i}`);
//       imgSlideActive.classList.add("img-slide-active");
//       console.log(i);
//       console.log(`${i}=active`);
//       let navSlideActive = document.getElementById(`sliderNav${i}`);
//       navSlideActive.classList.add("slider-active");
//       let textSlideActive = document.getElementById(`textSlider${i}`);
//       textSlideActive.classList.add("textSliderActive");
//       let imgSlideNonActive1 = document.getElementById(`imgSlide${i - 1}`);
//       imgSlideNonActive1.classList.remove("img-slide-active");
//       let navSlideNonActive = document.getElementById(`sliderNav${i - 1}`);
//       navSlideNonActive.classList.remove("slider-active");
//       let textSlideNonActive = document.getElementById(`textSlider${i - 1}`);
//       textSlideNonActive.classList.remove("textSliderActive");
//       console.log(`${i - 1}=Inactive`);
//     }

//     if (i == 4) {
//       let imgSlideNonActive2 = document.getElementById(`imgSlide${i - 1}`);
//       imgSlideNonActive2.classList.remove("img-slide-active");
//       let navSlideNonActive2 = document.getElementById(`sliderNav${i - 1}`);
//       navSlideNonActive2.classList.remove("slider-active");
//       let textSlideNonActive = document.getElementById(`textSlider${i - 1}`);
//       textSlideNonActive.classList.remove("textSliderActive");
//       console.log(`${i - 1}=Inactive`);
//       i = 1;
//       let imgSlideActive = document.getElementById(`imgSlide${i}`);
//       imgSlideActive.classList.add("img-slide-active");
//       console.log(i);
//       console.log(`${i}=active`);
//       let navSlideActive = document.getElementById(`sliderNav${i}`);
//       navSlideActive.classList.add("slider-active");
//       let textSlideActive = document.getElementById(`textSlider${i}`);
//       textSlideActive.classList.add("textSliderActive");
//     }
//     i++;
//   }, 2000);
  
// });

// sliderBtn2.addEventListener("click", () => {
//     clearLoop()
//   i = 2;
//   let a=  setInterval(() => {
//     if (i > 1 && i < 4) {
//       let imgSlideActive = document.getElementById(`imgSlide${i}`);
//       imgSlideActive.classList.add("img-slide-active");
//       console.log(i);
//       console.log(`${i}=active`);
//       let navSlideActive = document.getElementById(`sliderNav${i}`);
//       navSlideActive.classList.add("slider-active");
//       let textSlideActive = document.getElementById(`textSlider${i}`);
//       textSlideActive.classList.add("textSliderActive");
//       let imgSlideNonActive1 = document.getElementById(`imgSlide${i - 1}`);
//       imgSlideNonActive1.classList.remove("img-slide-active");
//       let navSlideNonActive = document.getElementById(`sliderNav${i - 1}`);
//       navSlideNonActive.classList.remove("slider-active");
//       let textSlideNonActive = document.getElementById(`textSlider${i - 1}`);
//       textSlideNonActive.classList.remove("textSliderActive");
//       console.log(`${i - 1}=Inactive`);
//     }

//     if (i == 4) {
//       let imgSlideNonActive2 = document.getElementById(`imgSlide${i - 1}`);
//       imgSlideNonActive2.classList.remove("img-slide-active");
//       let navSlideNonActive2 = document.getElementById(`sliderNav${i - 1}`);
//       navSlideNonActive2.classList.remove("slider-active");
//       let textSlideNonActive = document.getElementById(`textSlider${i - 1}`);
//       textSlideNonActive.classList.remove("textSliderActive");
//       console.log(`${i - 1}=Inactive`);
//       i = 1;
//       let imgSlideActive = document.getElementById(`imgSlide${i}`);
//       imgSlideActive.classList.add("img-slide-active");
//       console.log(i);
//       console.log(`${i}=active`);
//       let navSlideActive = document.getElementById(`sliderNav${i}`);
//       navSlideActive.classList.add("slider-active");
//       let textSlideActive = document.getElementById(`textSlider${i}`);
//       textSlideActive.classList.add("textSliderActive");
//     }
//     i++;
//   }, 2000);
// });

// sliderBtn3.addEventListener("click", () => {
//     clearLoop()
//     i = 3;
//     let a=  setInterval(() => {
//       if (i > 1 && i < 4) {
//         let imgSlideActive = document.getElementById(`imgSlide${i}`);
//         imgSlideActive.classList.add("img-slide-active");
//         console.log(i);
//         console.log(`${i}=active`);
//         let navSlideActive = document.getElementById(`sliderNav${i}`);
//         navSlideActive.classList.add("slider-active");
//         let textSlideActive = document.getElementById(`textSlider${i}`);
//         textSlideActive.classList.add("textSliderActive");
//         let imgSlideNonActive1 = document.getElementById(`imgSlide${i - 1}`);
//         imgSlideNonActive1.classList.remove("img-slide-active");
//         let navSlideNonActive = document.getElementById(`sliderNav${i - 1}`);
//         navSlideNonActive.classList.remove("slider-active");
//         let textSlideNonActive = document.getElementById(`textSlider${i - 1}`);
//         textSlideNonActive.classList.remove("textSliderActive");
//         console.log(`${i - 1}=Inactive`);
//       }
  
//       if (i == 4) {
//         let imgSlideNonActive2 = document.getElementById(`imgSlide${i - 1}`);
//         imgSlideNonActive2.classList.remove("img-slide-active");
//         let navSlideNonActive2 = document.getElementById(`sliderNav${i - 1}`);
//         navSlideNonActive2.classList.remove("slider-active");
//         let textSlideNonActive = document.getElementById(`textSlider${i - 1}`);
//         textSlideNonActive.classList.remove("textSliderActive");
//         console.log(`${i - 1}=Inactive`);
//         i = 1;
//         let imgSlideActive = document.getElementById(`imgSlide${i}`);
//         imgSlideActive.classList.add("img-slide-active");
//         console.log(i);
//         console.log(`${i}=active`);
//         let navSlideActive = document.getElementById(`sliderNav${i}`);
//         navSlideActive.classList.add("slider-active");
//         let textSlideActive = document.getElementById(`textSlider${i}`);
//         textSlideActive.classList.add("textSliderActive");
//       }
//       i++;
//     }, 2000);
// });



function mobileMenu(){
  desktopMenu.classList.toggle('mobile-menu-active')
}
hamburgerBtn.addEventListener('click',mobileMenu)
