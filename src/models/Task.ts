import {
  Sequelize,
  Model,
  DataTypes,
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin
} from 'sequelize';
import { User } from './User';

export class Task extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public isCompleted!: boolean;
  public priority!: number;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // from assotiations
  public CreatorId!: number;

  public createCreator!: BelongsToCreateAssociationMixin<User>;
  public getCreator!: BelongsToGetAssociationMixin<User>;
  public setCreator!: BelongsToSetAssociationMixin<User, number>;

  public readonly Creator?: User;

  public static associations: {
    Creator: Association<Task, User>;
  };
}

export const TaskFactory = (sequelize: Sequelize): void => {
  const task = Task.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: new DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      priority: {
        type: DataTypes.INTEGER
      }
    },
    {
      tableName: 'Tasks',
      sequelize
    }
  );

  return task;
};
