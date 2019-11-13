import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import DataBase from './models';
import * as controllers from './routes';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import Passport from './config/passport';

class CrmServer extends Server {
  dBase: DataBase;

  constructor() {
    super(true);
    this.dBase = new DataBase();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    // Allow any method from any host and log requests
    this.app.use(cors());
    this.app.use((req, res, next) => {
      if (req.method !== 'OPTIONS') {
        Logger.Imp(`${req.ip} ${req.method} ${req.url}`);
        next();
      }
    });
    Passport.init();
    this.setupControllers();
    this.setupStaticFolders();
  }

  private setupControllers(): void {
    const ctlrInstances = [];
    for (const name in controllers) {
      if (controllers.hasOwnProperty(name)) {
        const controller = (controllers as any)[name];
        ctlrInstances.push(new controller());
      }
    }
    super.addControllers(ctlrInstances);
  }

  private setupStaticFolders(): void {
    // Set static folder
    this.app.use(express.static(path.join(__dirname, '../webApp/dist')));
    this.app.use('/api/images/userpic', express.static(path.join(__dirname, '../uploads/images/userpic/')));

    this.app.get('/*', (req, res) => {
      res.sendFile(path.join(__dirname, '../webApp/dist/index.html'));
    });
  }

  public start(port: number): void {
    if (process.env.NODE_ENV !== 'production') {
      // Sync DB
      this.dBase.sequel
        .sync({
          alter: true
          // force: true
        })
        .then(() => {
          this.app.listen(port, '127.0.0.1', () => {
            Logger.Info(`Server is listening on ${port}`);
          });
        });
    } else {
      this.app.listen(port, () => {
        Logger.Info(`Server is listening on ${port}`);
      });
    }
  }
}

export default CrmServer;
