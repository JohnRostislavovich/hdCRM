import { Sequelize } from 'sequelize';
import { User, UserFactory } from './User';
import { Logger } from '@overnightjs/logger';
import { UserSession, UserSessionFactory } from './UserSession';
import { PasswordAttribute, PasswordAttributeFactory } from './PasswordAttribute';
import { Role, RoleFactory } from './Role';
import { Privilege, PrivilegeFactory } from './Privilege';
import { Asset, AssetFactory } from './Asset';
import { Plan, PlanFactory } from './Plan';
import { Stage, StageFactory } from './Stage';
import { PlanStage, PlanStageFactory } from './PlanStage';
import { Department, DepartmentFactory } from './Department';
import { RolePrivilege, RolePrivilegeFactory } from './RolePrivileges';
import { OrganizationFactory, Organization } from './Organization';
import { TaskFactory, Task } from './Task';
import { TaskPriorityFactory, TaskPriority } from './TaskPriority';
import { PreferenceFactory, Preference } from './Preference';
import { FormFactory, Form } from './Form';

class DataBase {
  sequelize: Sequelize;

  constructor() {
    this.sequelize = new Sequelize(process.env.DATABASE_URL, {
      ...(process.env.NODE_ENV !== 'development' && {
        ssl: true,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false // <<<<<< YOU NEED THIS
          }
        }
      })
    });
    this.createModels();
  }

  private createModels(): void {
    OrganizationFactory(this.sequelize);
    AssetFactory(this.sequelize);
    DepartmentFactory(this.sequelize);
    PasswordAttributeFactory(this.sequelize);
    PlanFactory(this.sequelize);
    PlanStageFactory(this.sequelize);
    PrivilegeFactory(this.sequelize);
    RoleFactory(this.sequelize);
    RolePrivilegeFactory(this.sequelize);
    StageFactory(this.sequelize);
    UserFactory(this.sequelize);
    UserSessionFactory(this.sequelize);
    TaskFactory(this.sequelize);
    TaskPriorityFactory(this.sequelize);
    PreferenceFactory(this.sequelize);
    FormFactory(this.sequelize);

    // associations
    Organization.hasMany(Department, {
      onDelete: 'cascade'
    });
    Organization.hasMany(Plan);
    Organization.hasMany(Role);
    Organization.hasMany(User);

    Department.belongsTo(Organization);
    Plan.belongsTo(Organization);
    Role.belongsTo(Organization);
    User.belongsTo(Organization);

    User.belongsTo(Role);
    User.belongsToMany(Asset, { through: 'UserAssets', foreignKey: 'UserId' });
    User.belongsTo(Asset, { as: 'avatar' });
    User.belongsToMany(Plan, {
      as: 'PlansTakesPartIn',
      through: 'UserPlans',
      foreignKey: 'UserId'
    });
    User.hasMany(UserSession);
    User.hasOne(Department, {
      as: 'ManagedDepartment',
      foreignKey: 'managerId',
      onDelete: 'set null'
    });
    User.belongsTo(Department, { constraints: false });
    User.hasOne(PasswordAttribute, {
      as: 'PasswordAttributes',
      foreignKey: 'UserId',
      onDelete: 'cascade'
    });
    User.hasMany(Task, { foreignKey: 'CreatorId' });
    User.hasOne(Preference);
    Preference.belongsTo(User);

    UserSession.belongsTo(User);
    PasswordAttribute.belongsTo(User);
    Asset.belongsToMany(User, { through: 'UserAssets', foreignKey: 'AssetId' });
    Role.hasMany(User);
    Plan.belongsTo(User, { as: 'Creator' });
    Plan.belongsToMany(User, {
      as: 'Participants',
      through: 'UserPlans',
      foreignKey: 'PlanId'
    });

    Department.belongsTo(User, { as: 'Manager', foreignKey: 'managerId' });

    Department.hasMany(User, {
      as: 'Workers',
      foreignKey: 'DepartmentId',
      constraints: false
    });

    Role.belongsToMany(Privilege, {
      through: RolePrivilege,
      foreignKey: 'RoleId'
    });
    Privilege.belongsToMany(Role, {
      through: RolePrivilege,
      foreignKey: 'PrivilegeId'
    });

    Plan.belongsToMany(Asset, {
      as: 'Documents',
      through: 'PlanAssets',
      foreignKey: 'PlanId'
    });
    Plan.belongsTo(Stage, { as: 'activeStage' });
    Plan.belongsToMany(Stage, {
      as: 'Stages',
      through: PlanStage,
      foreignKey: 'PlanId'
    });
    Stage.hasMany(Plan, { foreignKey: 'activeStageId' });
    Stage.belongsToMany(Plan, {
      as: 'StagePlans',
      through: PlanStage,
      foreignKey: 'StageId'
    });
    Asset.belongsToMany(Plan, { through: 'PlanAssets', foreignKey: 'AssetId' });

    Department.belongsTo(Department, {
      as: 'ParentDepartment',
      foreignKey: 'parentDepId'
    });
    Department.hasMany(Department, {
      as: 'SubDepartments',
      foreignKey: 'parentDepId'
    });

    Task.belongsTo(User, { as: 'Creator' });
    Task.belongsTo(TaskPriority);
    TaskPriority.hasMany(Task);

    Logger.Info(`DataBase inited`);
  }

  public get sequel(): Sequelize {
    return this.sequelize;
  }
}

export default DataBase;

export {
  Asset,
  Department,
  PasswordAttribute,
  Plan,
  PlanStage,
  Privilege,
  Role,
  RolePrivilege,
  Stage,
  User,
  UserSession,
  Organization,
  Task,
  TaskPriority,
  Preference,
  Form,
  Sequelize
};
