setup:
	./.devcontainer/setup.sh

start:
	npm start

dev-start:
	cd infra && \
	docker compose up -d; \
	docker compose logs -f

stop:
	cd infra && docker compose down

test:
	npm test

ci-test:
	npm test -- --coverage --reporters=jest-junit

ci-eslint:
	npm run eslint -- --format junit --output-file ./reports/eslint/eslint.xml

openapi-codegen:
	npx openapi \
		--input http://app:8000/openapi.json \
		--output ./src/client \
		--client axios

clean-docker:
	docker system prune -f
