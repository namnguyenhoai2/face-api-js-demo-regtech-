import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "./App.css";

import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

function App() {
  const idCardRef = useRef();
  const selfieRef = useRef();
  const isFirstRender = useRef(true);

  const [imageOne, setImageOne] = useState("");
  const [imageTwo, setImageTwo] = useState("");
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
      console.log("Loading the models");
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      console.log("Loading Done!");
    })();
  }, []);

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleChangeImageOne = (e) => {
    console.log(e.target.files);
    const data = new FileReader();
    data.addEventListener("load", () => {
      console.log("imageOne");
      console.log(data.result);
      setImageOne(data.result);
      console.log({ imageOne });
    });

    data.addEventListener("error", (event) => {
      console.log("error");
      console.log(event);
    });

    data.readAsDataURL(e.target.files[0]);
  };

  const handleChangeImageTwo = (e) => {
    console.log(e.target.files);
    const data = new FileReader();
    data.addEventListener("load", () => {
      console.log("imageTwo");
      console.log(data.result);
      setImageTwo(data.result);
      console.log({ imageTwo });
    });

    data.addEventListener("error", (event) => {
      console.log("error");
      console.log(event);
    });

    data.readAsDataURL(e.target.files[0]);
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
      const idCardFacedetection = await faceapi.detectSingleFace(idCardRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

      // detect a single face from the selfie image
      const selfieFacedetection = await faceapi.detectSingleFace(selfieRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

      // console.log(idCardFacedetection);
      // console.log(selfieFacedetection);

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
      if (idCardFacedetection && selfieFacedetection) {
        // Using Euclidean distance to comapare face descriptions
        const distance = faceapi.euclideanDistance(idCardFacedetection.descriptor, selfieFacedetection.descriptor);
        console.log(distance);
        setResultCompare(distance);
      }
    })();
  };

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Item>
            {/* <input type="file" onChange={handleChangeImageOne} /> */}

            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
              Ảnh 1
              <VisuallyHiddenInput type="file" onChange={handleChangeImageOne} />
            </Button>
            <br></br>
            <img ref={idCardRef} src={imageOne} height="300px" />
          </Item>
        </Grid>
        <Grid item xs={6}>
          <Item>
            {/* <input type="file" onChange={handleChangeImageTwo} /> */}

            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
              Ảnh 2
              <VisuallyHiddenInput type="file" onChange={handleChangeImageTwo} />
            </Button>

            <br></br>
            <img ref={selfieRef} src={imageTwo} height="300px" />
          </Item>
        </Grid>
        <Grid item xs={4}>
          {/* <Item>xs=4</Item> */}
        </Grid>
        <Grid item xs={4}>
          <Item>
            <div>
              <Button onClick={checkImage} variant="contained">
                Check
              </Button>

              <br></br>

              <h3 style={{ color: "red" }}>{resultCompare}</h3>
              <h2>{resultCompare}OK</h2>
            </div>
          </Item>
        </Grid>
        <Grid item xs={4}>
          {/* <Item>xs=8</Item> */}
        </Grid>
      </Grid>
    </>
  );
}

export default App;
