start:
	PORT=80 \
	SECRET='gateway725'
	MONGOHQ_URL='mongodb://codeacy.com:27017/chat' \
	node app

.PHONY: test db start