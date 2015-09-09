start:
	PORT=80 \
	SECRET='gateway725' \
	MONGOHQ_URL='mongodb://localhost:27017/chat' \
	node app

.PHONY: test db start
