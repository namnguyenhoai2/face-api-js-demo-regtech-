import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "./App.css";

import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Slider from "@mui/material/Slider";

// icon
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ContrastIcon from '@mui/icons-material/Contrast';
import Brightness5Icon from '@mui/icons-material/Brightness5';
import Stack from '@mui/material/Stack';

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
  // const isFirstRender = useRef(true);

  const [imageOne, setImageOne] = useState("");
  const [imageOneHidden, setImageOneHidden] = useState("");

  const [imageTwo, setImageTwo] = useState("");
  const [imageTwoHidden, setImageTwoHidden] = useState("");
  const [resultCompare, setResultCompare] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [isError, setIsError] = useState(false);

  const [tempValue1, setTempValue1] = useState(5000);
  const [tempValue2, setTempValue2] = useState(5000);

  const [contrastValue1, setContrastValue1] = useState(0);
  const [contrastValue2, setContrastValue2] = useState(0);

  const [brightValue1, setBrightValue1] = useState(0);
  const [brightValue2, setBrightValue2] = useState(0);


  const handleChangeTempValue1 = (event, newValue) => {
    setTempValue1(newValue);

    window.Caman("#image1", function () {
      this.revert(true); // update the canvas' context
      // this.whiteBalanceRgb(newValue); // in case of RGB input
      this.whiteBalance(newValue); // in case of color temperature input

      this.render(function () {
        setImageOne(this.toBase64());
      });
    });
  };

  const handleChangeTempValue2 = (event, newValue) => {
    setTempValue2(newValue);

    window.Caman("#image2", function () {
      this.revert(true); // update the canvas' context
      // this.whiteBalanceRgb(newValue); // in case of RGB input
      this.whiteBalance(newValue); // in case of color temperature input

      this.render(function () {
        setImageTwo(this.toBase64());
      });
    });
  };

  const handleChangeContrastValue1 = (event, newValue) => {
    setContrastValue1(newValue);

    window.Caman("#image1", function () {
      this.revert(true); // update the canvas' context
      this.contrast(newValue); // in case of color temperature input
      this.render(function () {
        setImageOne(this.toBase64());
      });
    });
  };

  const handleChangeContrastValue2 = (event, newValue) => {
    setContrastValue2(newValue);

    window.Caman("#image2", function () {
      this.revert(true); // update the canvas' context
      this.contrast(newValue); // in case of color temperature input
      this.render(function () {
        setImageTwo(this.toBase64());
      });
    });
  };


  const handleChangeBrightValue1 = (event, newValue) => {
    setBrightValue1(newValue);

    window.Caman("#image1", function () {
      this.revert(true); // update the canvas' context
      this.brightness(newValue); // in case of color temperature input
      this.render(function () {
        setImageOne(this.toBase64());
      });
    });
  };

  const handleChangeBrightValue2= (event, newValue) => {
    setBrightValue2(newValue);

    window.Caman("#image2", function () {
      this.revert(true); // update the canvas' context
      this.brightness(newValue); // in case of color temperature input
      this.render(function () {
        setImageTwo(this.toBase64());
      });
    });
  };

  const rgbColor = { r: 119, g: 119, b: 119 };
  const colorTemperature = 9500; // e.g. some temperature between 0 and 40,000 K

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

  const handleChangeImageOne = (e) => {
    console.log(e.target.files);
    const data = new FileReader();
    data.addEventListener("load", () => {
      console.log("imageOne");
      console.log(data.result);
      setImageOne(data.result);
      console.log({ imageOne });

      // TODO:
      setImageOneHidden(data.result);

      document.querySelector("#image1").removeAttribute("data-caman-id");
      window.Caman("#image1", data.result, function () {
        this.render();
      });
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
      // TODO:
      setImageTwoHidden(data.result);

      document.querySelector("#image2").removeAttribute("data-caman-id");
      window.Caman("#image2", data.result, function () {
        this.render();
      });
    });

    data.addEventListener("error", (event) => {
      console.log("error");
      console.log(event);
    });

    data.readAsDataURL(e.target.files[0]);
  };

  const WhiteBalance = () => {
    window.Caman("#image1", function () {
      // this.brightness(5);
      // this.contrast(30);
      // this.sepia(60);
      // this.saturation(-30);

      this.revert(true); // update the canvas' context
      this.whiteBalanceRgb(rgbColor); // in case of RGB input
      // this.whiteBalance(colorTemperature); // in case of color temperature input

      this.render(function () {
        // console.log("this.toBase64()")
        // console.log(this.toBase64())
        setImageOne(this.toBase64());
      });
    });
    // console.log(window.IJS);

    // let image = window.IJS.Image.load(document.getElementById("image").src);

    // (async () => {
    //   let image = await window.IJS.Image.load(document.getElementById("image").src);

    //   console.log(image.getHistogram({channel : 0}));
    //   let grey = image.grey().setBorder({size: 10});

    //   document.getElementById("image").src = grey.toDataURL();
    // })();
  };

  const WhiteBalance2 = () => {
    window.Caman("#image2", function () {
      // this.brightness(5);
      // this.contrast(30);
      // this.sepia(60);
      // this.saturation(-30);

      this.revert(true); // update the canvas' context
      this.whiteBalanceRgb(rgbColor); // in case of RGB input
      // this.whiteBalance(colorTemperature); // in case of color temperature input

      this.render(function () {
        // console.log("this.toBase64()")
        // console.log(this.toBase64())
        setImageTwo(this.toBase64());
      });
    });
    // console.log(window.IJS);

    // let image = window.IJS.Image.load(document.getElementById("image").src);

    // (async () => {
    //   let image = await window.IJS.Image.load(document.getElementById("image").src);

    //   console.log(image.getHistogram({channel : 0}));
    //   let grey = image.grey().setBorder({size: 10});

    //   document.getElementById("image").src = grey.toDataURL();
    // })();
  };

  const checkImage = () => {
    setResultCompare(0);
    setIsLoading(true);
    setIsError(false);
    setIsWarning(false);
    setIsSuccess(false);

    (async () => {
      // loading the models
      // await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      // await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      // await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      // await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      // await faceapi.nets.faceExpressionNet.loadFromUri('/models');

      // detect a single face from the ID card image
      const idCardFacedetection = await faceapi.detectSingleFace(idCardRef.current, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptor();

      // detect a single face from the selfie image
      const selfieFacedetection = await faceapi.detectSingleFace(selfieRef.current, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptor();

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
        setIsLoading(false);

        if (distance <= 0.45) {
          setIsSuccess(true);
        } else {
          setIsWarning(true);
        }
      } else {
        setIsError(true);
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
            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
              Ảnh 1
              <VisuallyHiddenInput type="file" onChange={handleChangeImageOne} />
            </Button>
            <br></br>
            <img ref={idCardRef} src={imageOne} />

            <br></br>
            {/* {imageOne && (
              <Button onClick={WhiteBalance} variant="contained">
                White Balance
              </Button>
            )} */}

            {imageOne && (
              <Box sx={{ width: 300 }}>
                <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                  <ThermostatIcon />
                  <Slider aria-label="Temperature" value={tempValue1} onChange={handleChangeTempValue1} valueLabelDisplay="auto" step={100} marks min={1700} max={27000} />
                </Stack>
                <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                  <ContrastIcon />
                  <Slider aria-label="Contrast" value={contrastValue1} onChange={handleChangeContrastValue1} valueLabelDisplay="auto" step={1} marks min={-100} max={100} />
                </Stack>
                <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                  <Brightness5Icon />
                  <Slider aria-label="Bright" value={brightValue1} onChange={handleChangeBrightValue1} valueLabelDisplay="auto" step={1} marks min={-100} max={100} />
                </Stack>
                
              </Box>
            )}

            <img className="hidden-image" id="image1" src={imageOneHidden} />
          </Item>
        </Grid>
        <Grid item xs={6}>
          <Item>
            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
              Ảnh 2
              <VisuallyHiddenInput type="file" onChange={handleChangeImageTwo} />
            </Button>
            <br></br>
            <img ref={selfieRef} src={imageTwo} />
            <br></br>
            {/* {imageTwo && (
              <Button onClick={WhiteBalance2} variant="contained">
                White Balance
              </Button>
            )} */}

            {imageTwo && (

              <Box sx={{ width: 300 }}>
              <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                <ThermostatIcon />
                <Slider aria-label="Temperature" value={tempValue2} onChange={handleChangeTempValue2} valueLabelDisplay="auto" step={100} marks min={1700} max={27000} />
              </Stack>
              <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                <ContrastIcon />
                <Slider aria-label="Contrast" value={contrastValue2} onChange={handleChangeContrastValue2} valueLabelDisplay="auto" step={1} marks min={-100} max={100} />
              </Stack>
              <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                <Brightness5Icon />
                <Slider aria-label="Bright" value={brightValue2} onChange={handleChangeBrightValue2} valueLabelDisplay="auto" step={1} marks min={-100} max={100} />
              </Stack>
              
            </Box>

            )}

            <img className="hidden-image" id="image2" src={imageTwoHidden} />
          </Item>
        </Grid>
        <Grid item xs={4}>
          {/* <Item>xs=4</Item> */}
        </Grid>
        <Grid item xs={4}>
          {isLoading && <LinearProgress />}
          <Item>
            <div>
              <Button onClick={checkImage} variant="contained">
                Check
              </Button>

              <br></br>

              {/* <h3 style={{ color: "red" }}>{resultCompare}</h3>
              <h2>{resultCompare}OK</h2> */}

              {isWarning && <Alert severity="warning">Kết quả không trùng khớp — {resultCompare}</Alert>}
              {isSuccess && <Alert severity="success">Kết quả trùng khớp - {resultCompare}</Alert>}
              {isError && <Alert severity="error">Lỗi</Alert>}
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
