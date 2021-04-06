# Verteilte Systeme Portfolio: Weather App

Portfolio for the class Verteilte Systeme. You can find the Repository [here](https://github.com/relativityhd/verteilte-systeme-weather-app).

The app is hosted on the IBM Cloud until end of April 2021 and can be viewed here:

```sh
curl http://159.122.175.119:30922/api/V1/recommend?lat=48.764218&lon=9.168190
```

## API v1

`{base-url}/api/v1`

Get Weather recommendations:

```pseudo
GET {base-url}/api/V1/recommend?lat=48.764218&lon=9.168190
```

Parameter:
`lat`: Latitude, `FLOAT` between -90 & 90
`lon`: Longitude, `FLOAT` between -180 & 180

Return codes:
`200`: JSON with recommendation Data:

```JSON
{
  "clothes": "tshirt | sweater | coat",
  "risk": "low | moderate | high",
  "umbrella": "no | yes"
}
```

`400`: Wrong / Missing Parameters
`408`: Timeout
`500`: Undefined Error
`*`: Error Code from Weather API

## Code-Structure

In the `src/server.js` is an ExpressJS server implemented, which uses the (later different) API versions (v1 etc.) from the `src` folder. The V1 API is implemented via an Express Router in the `src/v1/api.js` and uses functions defined in the `src/v1/logic.js`. This Structure allows to easily add more API versions and helps to keep the Code clear and understandable. The deployment specifications can be found in the `deployment` directory.

## Environment & Secrets

`OPEN_WEATHER_API_KEY`:
`OPEN_WEATHER_API`: Url to the Open Weather API Endpoint, default: `https://api.openweathermap.org/data/2.5/onecall`
`TIMEOUT`: Time after which the request to the Open Weather API gets canceled, default: `10000` (10s)

## Setup DEV

First-Time-Setup:

1. Create a `.env` file, copy the `.env.template` into it, and insert your Open Weather API Key. You can get the API Key from here: <https://home.openweathermap.org/api_keys>
2. Install Dependencies:

```sh
npm i
```

To start in developing mode run:

```sh
npm run dev
```

## Setup PROD

This project is hosted on the IBM Kubernetes Service and each release is published via GitHub Actions.

### GitHub Actions (CI/ CD)

The workflow is based on the IBM Kubernetes Action: <https://github.com/actions/starter-workflows/blob/ab8c670fafe65faf1574245c8fd327fae319d88f/ci/ibm.yml>.

There is one deploy workflow which is triggered at every new release, defined by the file `.github/workflows/deploy.yml`. The workflow has 6 Steps:

1. Checkout
2. Install IBM Cloud CLI
3. Authenticate with IBM Cloud CLI
4. Build with Docker
5. Push the image to ICR
6. Deploy to ICR

The workflow depends on two Repository Secrets: `ICR_NAMESPACE` and `IBM_CLOUD_API_KEY`. These were added in the Repository Settings. The workflow also is set up via workflow-specific environment variables which are specified in the file. (III. of 12 Factor App Model)

Steps 4. and 5. are the building steps, where the workflow builds a Docker Image based on the provided `Dockerfile` which is just a simple NodeJS Docker Image. This Image then gets pushed to the IBM Container Registry. In the last step, the image gets pulled from the IBM Container Registry into the IBM Kubernetes Service. This step uses the `deployment/deployment.yaml` and the `deployment/service.yaml` files.

The workflow uses all the commands for the Docker and Kubernetes Services which are described below. If you can't reproduce a command below then try to copy the workflows commands!

### Docker

The docker image can locally be built with the command:

```sh
docker build -t weather-app:latest .
```

This tags the image with `weather-app:latest` and it can be run in a container with the command:

```sh
docker run -p 80:30922 weather-app:latest
```

This will start the server in a docker container and can be accessed via `http://localhost:80`. The `-p 80:30922` bind the container port `30922` to the local machines port `80`, so it can be accessed. To do so the container's port `30922` must be exposed in the image build via `EXPOSE 30922`.

### Kubernetes

For the following commands you must be connected to a kubectl service, like the IBM Kubernetes Service or MiniKube.

#### Configmap

The two environment variables `TIMEOUT` and `OPEN_WEATHER_API` are stored in a configmap on the IBM Kubernetes Service, created with the command:

```sh
kubectl create configmap weather-app-config \
  --from-literal=TIMEOUT=10000 \
  --from-literal=OPEN_WEATHER_API=https://api.openweathermap.org/data/2.5/onecall
```

This configmap is then consumed in the deploy step defined in the `deployment/deployment.yaml` via the `envFrom` `configMapRef`.

#### Secrets

The secret variable `OPEN_WEATHER_API_KEY` is stored in a secret on the IBM Kubernetes Service, created with the command:

```sh
kubectl create secret generic weather-app-secret \
  --from-literal=OPEN_WEATHER_API_KEY=*SECRET_API_KEY_HERE*
```

This secret is then consumed in the deploy step defined in the `deployment/deployment.yaml` via the `envFrom` `secretRef`.

#### Deployment & Service

The `deployment/deployment.yaml` and `secret.yaml` were both created with the commands:

```sh
kubectl create deployment $DEPLOYMENT_NAME --image=$REGISTRY_HOSTNAME/$ICR_NAMESPACE/$IMAGE_NAME:latest --dry-run -o yaml
kubectl create service nodeport $DEPLOYMENT_NAME --tcp=80:$PORT --dry-run -o yaml
```

and later edited, so they consume the configmap and the secret. The variables where defined in the workflow environment.

The service uses a NodePort binding to publish the server under the port `30922`. Since the IP of the projects cluster in the IBM cloud is `159.122.175.119`, the server (API) can be accessed via:

<http://159.122.175.119:30922/api/V1/recommend?lat=48.764218&lon=9.168190>
