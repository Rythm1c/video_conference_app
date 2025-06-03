# Video conference app with collaborative whiteboard

As the title suggests this is a video conference app with a collaborative white board which multiple users can work on.
The front-end is made using react.
The back-end uses django for user management,draw calls,and realtime communication with the help of websockets

Dependencies can be found in the requirements.txt and package.json files.

## How to run the app

### step 1:
 open your terminal and run 

```
git clone (repository source)
```

### step 2: 
next navigate to the main folder after cloning 

```
cd location/of/cloned/repo
```

### step 3:
after that create a virtual environment and activating it then run

```
pip install -r requirements 
```

### step 4:
run the back end with the following command

```
daphne -b 0.0.0.0 -p 8000 whiteboard_backend.asgi:application
```

### step 5:
open another terminal and navigate into the folder for the frontend

```
cd ./whiteboard-frontend
```

### step 6:
run the following command

```
npm install
```

### step 7:
run the front end with 

```
npm run dev
```




