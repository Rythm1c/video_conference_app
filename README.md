# Video conference app with collaborative whiteboard(WEMEET)

As the title suggests this is a video conference app with a collaborative white board which multiple users can work on.
The [front-end](https://github.com/Rythm1c/video_conference_app-frontend) is made using react.
The back-end uses django for user management,draw calls,and realtime communication with the help of websockets

Dependencies can be found in the requirements.txt and package.json files.

## How to run the app on local machine

make sure you have redis installed and is running on your OS 
Depending on your os follow the steps in [this](https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/) page to install redis

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
after that create a virtual environment and activate it then run the following

```
pip install -r requirements.txt
```

### step 4:
run the back end with the following command

```
python manage.py makemigrations users
python manage.py makemigrations rooms
python manage.py migrate
daphne -b 0.0.0.0 -p 8000 whiteboard_backend.asgi:application
```




