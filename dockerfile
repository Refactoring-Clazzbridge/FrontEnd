# 베이스 이미지를 명시해준다.
FROM node:18 AS build


# 작업 디렉토리 설정
WORKDIR /FrontEnd

# package.json과 package-lock.json 복사
COPY package.json package-lock.json ./

# 추가적으로 필요한 파일들을 다운로드 받는다.
RUN npm install

# 애플리케이션 소스 코드 복사
COPY ./ ./

# 애플리케이션 빌드
RUN npm run build  # 빌드 명령어를 추가

# 빌드 결과물 위치로 이동
WORKDIR /FrontEnd/build

# 컨테이너에서 사용할 포트 노출
EXPOSE 3000

# 컨테이너 시작 시 실행 될 명령어를 명시해준다.
CMD ["npx", "serve", "-s", "."]  # 빌드된 파일 서빙
