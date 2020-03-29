import 'reflect-metadata';
import { inject } from 'inversify';
import Kernel from '../../src/Framework/Kernel';
import { ParametersList, UniqueParameterIdentifier, Parameter } from '../../src/Framework/Container/Items/Parameter';
import { ServiceList } from '../../src/Framework/Container/Items/Service';

class Child {

    do(): number {
        return 1
    }
}

class Parent {
    constructor(
        @inject('child') public readonly child: Child,
        @inject('demo') public readonly demo: number,
    ) {}
    
}

const parameters: ParametersList = new Map<UniqueParameterIdentifier, Parameter>([
    ['demo', 1]
]);

const services: ServiceList = new Map([
    ['child', {instance: Child}],
    ['parent', {instance: Parent}],
]);

describe("Kernel", () => { 
    it("Kernel should be able to create a container", async () => {
        expect.assertions(4);

        const kernel = await Kernel.create(
            'test', 
            true, 
            services, 
            parameters
        );

        const parentInstance: Parent = kernel.container.get('parent');
        expect(parentInstance).toBeInstanceOf(Parent);
        expect(parentInstance).toEqual(kernel.container.get('parent'));
        expect(parentInstance.child.do()).toEqual(1);
        expect(parentInstance.demo).toEqual(1);
    });
});
