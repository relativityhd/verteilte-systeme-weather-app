# verteilte-systeme-weather-app

Portfolioprüfung für das Fach Verteilte Systeme

<http://159.122.175.119:30922/api/V1/recommend?lat=48.764218&lon=9.168190>

## API v1

`{base-url}/api/v1`

Get Weather recommendations:

```pseudo
GET {base-url}/api/V1/recommend?lat=48.764218&lon=9.168190
```

Parameter:
`lat`: Latitude, `FLOAT` between -90 & 90
`lon`: Longitude, `FLOAT` between -180 & 180

Returncodes:
`200`: JSON with recommendation Data:

```json
{
  "clothes": "tshirt" | "sweater" | "coat",
  "risk": "low" | "moderate" | "high",
  "umbrella": "no" | "yes"
}
```

`400`: Wrong / Missing Parameters
`408`: Timeout
`500`: Undefined Error
`*`: Error Code from Weather API

## Code-Structure

In the `server.js` is an ExpressJS server implemented, which uses the (later different) API versions (v1 etc.) from the `src` folder. The V1 API is implemented via an Express Router in the `src/v1/api.js` and uses functions defined in the `src/v1/logic.js`. This Structure allows to easily add more API versions and helps keeping the Code clear and understandable.

## Environment & Secrets

`OPEN_WEATHER_API_KEY`:
`OPEN_WEATHER_API`: Url to the Open Weather API Endpoint, default: `https://api.openweathermap.org/data/2.5/onecall`
`TIMEOUT`: Time after which the request to the Open Weather API gets cancelled, default: `10000` (10s)

## Setup DEV

First-Time-Setup:

1. Create a `.env` file, copy the `.env.template` into it and insert your Open Weather API Key. You can get the API Key from here: <https://home.openweathermap.org/api_keys>
2. Install Dependencies:

```sh
npm i
```

To start in developing mode run:

```sh
npm run dev
```

## Setup PROD

This project is hostet on the IBM Kubernetes Service and each release is published via GitHub Actions.

### GitHub Actions (CI/ CD)

The workflow is based on the IBM Kubernetes Action: <https://github.com/actions/starter-workflows/blob/ab8c670fafe65faf1574245c8fd327fae319d88f/ci/ibm.yml>.

There is one deploy workflow which is triggered at every new release, defined by the file `.github/workflows/deploy.yml`. The workflow has 6 Steps:

1. Checkout
2. Install IBM Cloud CLI
3. Authenticate with IBM Cloud CLI
4. Build with Docker
5. Push the image to ICR
6. Deploy to ICR

The workflow depends on two Repository Secrets: `ICR_NAMESPACE` and `IBM_CLOUD_API_KEY`. These were added in the Repository Settings. The workflow also is setup via workflow specific environment variables which are specified in the file. (III. of 12 Factor App Model)

Steps 4. and 5. are the building steps, where the workflow builds a Docker Image based on the provided `Dockerfile` which is just a simple NodeJS Docker Image. This Image then gets pushed to the IBM Container Registry. In the last Step the Image gets pulled from the IBM Container Regsitry into the IBM Kubernetes Service. This step uses the `deployment.yaml` and the `service.yaml` files.

### Docker

The docker image can locally be build with the command:

```sh
docker build -t weather-app:latest .
```

This tags the image with `weather-app:latest` and it can be runned in a container with the command:

```sh
docker run -p 80:30922 weather-app:latest
```

This will start the server in a docker container and can be accessed via `http://localhost:80`. The `-p 80:30922` bind the container port `30922` to the local machines port `80`, so it can be accessed. To do so the containers port `30922` must be exposed in the image build via `EXPOSE 30922`.

### Configmap

The two environment variables `TIMEOUT` and `OPEN_WEATHER_API` are stored in a configmap on the IBM Kubernetes Service, created with the command:

```sh
kubectl create configmap weather-app-config \
  --from-literal=TIMEOUT=10000 \
  --from-literal=OPEN_WEATHER_API=https://api.openweathermap.org/data/2.5/onecall
```

This configmap is then consumend in the deploy step defined in the `deployment.yaml` via the `envFrom` `configMapRef`.

### Secrets

The secret variable `OPEN_WEATHER_API_KEY` is stored in a secret on the IBM Kubernetes Service, created with the command:

```sh
kubectl create secret generic weather-app-secret \
  --from-literal=OPEN_WEATHER_API_KEY=*SECRET_API_KEY_HERE*
```

This secret is then consumend in the deploy step defined in the `deployment.yaml` via the `envFrom` `secretRef`.

### Deployment & Service

The `deployment.yaml` and `secret.yaml` where both created with the commands:

```sh
kubectl create deployment $DEPLOYMENT_NAME --image=$REGISTRY_HOSTNAME/$ICR_NAMESPACE/$IMAGE_NAME:latest --dry-run -o yaml
kubectl create service nodeport $DEPLOYMENT_NAME --tcp=80:$PORT --dry-run -o yaml
```

and later edited, so they consume the configmap and the secret. The variables where defined in the workflow environment.

The service uses a NodePort binding to publish the server under the port `30922`. Since the IP of the projects cluster in the IBM cloud is `159.122.175.119`, the server (api) can be accessed via:

<http://159.122.175.119:30922/api/V1/recommend?lat=48.764218&lon=9.168190>
