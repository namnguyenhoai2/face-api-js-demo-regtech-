import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "./App.css";

function App() {
  const idCardRef = useRef();
  const selfieRef = useRef();
  const isFirstRender = useRef(true);

  const [imageOne, setImageOne] = useState();
  const [imageTwo, setImageTwo] = useState();
  const [resultCompare, setResultCompare] = useState();

  const renderFace = async (image, x, y, width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    context?.drawImage(image, x, y, width, height, 0, 0, width, height);
    canvas.toBlob((blob) => {
      image.src = URL.createObjectURL(blob);
    }, "image/jpeg");
  };

  useEffect(() => {
    // Prevent the function from executing on the first render
    // if (isFirstRender.current) {
    //   isFirstRender.current = false; // toggle flag after first render/mounting
    //   return;
    // }

    (async () => {
      // loading the models
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');

    })();
  }, []);

  const handleChangeImageOne = (e) => {
    console.log(e.target.files);
    const data = new FileReader();
    data.addEventListener("load", () => {
      setImageOne(data.result);
      console.log("imageOne");
      console.log(imageOne);
    });

    data.readAsDataURL(e.target.files[0]);
  };

  const handleChangeImageTwo = (e) => {
    console.log(e.target.files);
    const data = new FileReader();
    data.addEventListener("load", () => {
      setImageTwo(data.result);
    });

    data.readAsDataURL(e.target.files[0]);
    console.log(imageTwo);
    console.log(imageTwo);
  };

  const checkImage = () => {
    (async () => {
      // loading the models
      // await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      // await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      // await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      // await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      // await faceapi.nets.faceExpressionNet.loadFromUri('/models');

      // detect a single face from the ID card image
      const idCardFacedetection = await faceapi.detectSingleFace(idCardRef.current,
        new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks().withFaceDescriptor();

      // detect a single face from the selfie image
      const selfieFacedetection = await faceapi.detectSingleFace(selfieRef.current,
        new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks().withFaceDescriptor();

      //(OPTIONAL)
      /**
       * If a face was detected from the ID card image,
       * call our renderFace() method to display the detected face.
       */
      if (idCardFacedetection) {
        const { x, y, width, height } = idCardFacedetection.detection.box;
        renderFace(idCardRef.current, x, y, width, height);
      }
      //(OPTIONAL)
      /**
       * If a face was detected from the selfie image,
       * call our renderFace() method to display the detected face.
       */
      if (selfieFacedetection) {
        const { x, y, width, height } = selfieFacedetection.detection.box;
        renderFace(selfieRef.current, x, y, width, height);
      }

      /**
       * Do face comparison only when faces were detected
       */
      if(idCardFacedetection && selfieFacedetection){
        // Using Euclidean distance to comapare face descriptions
        const distance = faceapi.euclideanDistance(idCardFacedetection.descriptor, selfieFacedetection.descriptor);
        console.log(distance);
        setResultCompare(distance);
      }

    })();
  };

  return (
    <>
      <div>
        <input type="file" onChange={handleChangeImageOne} />
        <br></br>
        <img ref={idCardRef}  src={imageOne} height="200px" />
      </div>

      <div>
        <input type="file" onChange={handleChangeImageTwo} />
        <br></br>
        <img ref={selfieRef} src={imageTwo} height="200px" />
      </div>

      <div>
        <button onClick={checkImage}>Check</button>
        <br></br>
        
        <h3 style={{color: "red"}}>{resultCompare}</h3>
      </div>
    </>
  );
}

export default App;
