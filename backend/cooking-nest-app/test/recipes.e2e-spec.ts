import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { RecipesModule } from '../src/recipes/recipes.module';

describe('Recipes (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let createdRecipeId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), RecipesModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('POST /data/recipes — should create a recipe', async () => {
    const res = await request(app.getHttpServer())
      .post('/data/recipes')
      .send({
        title: 'Pad Thaï',
        description: 'Plat thaïlandais',
        categoryCode: 'PLAT',
        difficultyCode: 'EASY',
        costCode: 'CHEAP',
        preparationDuration: 30,
        cookDuration: 15,
        steps: ['Étape 1', 'Étape 2'],
      })
      .expect(201);

    expect(res.body.title).toBe('Pad Thaï');
    expect(res.body._id).toBeDefined();
    createdRecipeId = res.body._id;
  });

  it('POST /data/recipes — should return 400 for invalid data', async () => {
    await request(app.getHttpServer())
      .post('/data/recipes')
      .send({ title: '' })
      .expect(400);
  });

  it('GET /data/recipes — should return paginated recipes', async () => {
    const res = await request(app.getHttpServer())
      .get('/data/recipes')
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
  });

  it('GET /data/recipes?title=pad — should filter by title', async () => {
    const res = await request(app.getHttpServer())
      .get('/data/recipes?title=pad')
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Pad Thaï');
  });

  it('GET /data/recipes?title=nonexistent — should return empty', async () => {
    const res = await request(app.getHttpServer())
      .get('/data/recipes?title=nonexistent')
      .expect(200);

    expect(res.body.data).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('GET /data/recipes?categoryCode=PLAT — should filter by category', async () => {
    const res = await request(app.getHttpServer())
      .get('/data/recipes?categoryCode=PLAT')
      .expect(200);

    expect(res.body.data).toHaveLength(1);
  });

  it('GET /data/recipes/:id — should return a recipe', async () => {
    const res = await request(app.getHttpServer())
      .get(`/data/recipes/${createdRecipeId}`)
      .expect(200);

    expect(res.body.title).toBe('Pad Thaï');
    expect(res.body.steps).toEqual(['Étape 1', 'Étape 2']);
  });

  it('GET /data/recipes/:id — should return 404 for unknown id', async () => {
    await request(app.getHttpServer())
      .get('/data/recipes/507f1f77bcf86cd799439011')
      .expect(404);
  });

  it('PUT /data/recipes/:id — should update a recipe', async () => {
    const res = await request(app.getHttpServer())
      .put(`/data/recipes/${createdRecipeId}`)
      .send({ title: 'Pad Thaï Revisité' })
      .expect(200);

    expect(res.body.title).toBe('Pad Thaï Revisité');
  });

  it('DELETE /data/recipes/:id — should delete a recipe', async () => {
    await request(app.getHttpServer())
      .delete(`/data/recipes/${createdRecipeId}`)
      .expect(204);
  });

  it('GET /data/recipes/:id — should return 404 after deletion', async () => {
    await request(app.getHttpServer())
      .get(`/data/recipes/${createdRecipeId}`)
      .expect(404);
  });
});
