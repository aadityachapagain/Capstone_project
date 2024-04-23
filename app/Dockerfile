FROM public.ecr.aws/lambda/python:3.12

# RUN yum update -y && \
#   yum install -y python3 python3-pip  python3-dev gcc && \
#   rm -RF /var/cache/yum

COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

ADD backend ./backend
COPY main.py ./
COPY transcript.txt ./
COPY transcript2.txt ./
COPY transcript3.txt ./

ENV TRANSFORMERS_CACHE="/tmp/transformers_cache"
CMD ["main.handler"]