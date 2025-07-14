FROM python:3.12

WORKDIR  /app

COPY  requet.txt /app

RUN pip install -r requet.txt

COPY . /app

EXPOSE 8000

CMD ["sh", "-c", "./script.sh && python manage.py runserver 0.0.0.0:8000"]