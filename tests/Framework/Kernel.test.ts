import 'reflect-metadata';
import {inject} from 'inversify';
import Kernel from '../../src/Framework/Kernel';
import {ParametersList, UniqueParameterIdentifier, Parameter} from '../../src/Framework/Container/Items/Parameter';
import ModuleContext from "../../src/Framework/Modules/ModuleContext";
import {ServiceList} from "../../src/Framework/Container/Items/Service";

// tslint:disable-next-line:max-classes-per-file
class Child {

    do(): number {
        return 1
    }
}

// tslint:disable-next-line:max-classes-per-file
class Parent {
    constructor(
        @inject('child') public readonly child: Child,
        @inject('demo') public readonly demo: number,
    ) {
    }

}

const parametersTest: ParametersList = new Map<UniqueParameterIdentifier, Parameter>([
    ['demo', 2]
]);

const parameters: ParametersList = new Map<UniqueParameterIdentifier, Parameter>([
    ['demo', 1]
]);

const services: ServiceList = new Map([
    ['child', {instance: Child}],
    ['parent', {instance: Parent}],
]);

const testModule = new ModuleContext({services});

describe("Kernel", () => {
    it("Kernel can receive a ModuleContext as instantiation", async () => {
        expect.assertions(4);

        const kernel = await Kernel.createFromModuleContext(
            'test',
            true,
            parameters,
            testModule
        );

        const parentInstance: Parent = kernel.container.get('parent');
        expect(parentInstance).toBeInstanceOf(Parent);
        expect(parentInstance).toEqual(kernel.container.get('parent'));
        expect(parentInstance.child.do()).toEqual(1);
        expect(parentInstance.demo).toEqual(1);
    });
    it("Kernel overwrites params only on TEST env", async () => {
        expect.assertions(3);

        const kernelAny = await Kernel.createFromModuleContext(
            'any',
            true,
            parameters,
            testModule,
            parametersTest
        );

        const demoAny: number = kernelAny.container.get<number>('demo');
        const kernelTest = await Kernel.createFromModuleContext(
            'test',
            false,
            parameters,
            testModule,
            parametersTest
        );

        const demoTest: number = kernelTest.container.get<number>('demo');
        const kernelProd = await Kernel.createFromModuleContext(
            'prod',
            false,
            parameters,
            testModule,
            parametersTest
        );

        const demoProd: number = kernelProd.container.get<number>('demo');

        expect(demoAny).toEqual(1)
        expect(demoTest).toEqual(2)
        expect(demoProd).toEqual(1)
    });
});
