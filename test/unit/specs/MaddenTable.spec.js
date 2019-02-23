import chai from 'chai';
import sinon from 'sinon';
import { shallowMount } from '@vue/test-utils';

import MaddenTable from '../../../src/renderer/components/MaddenTable';

const expect = chai.expect;
let sandbox;

const stubbedFileData = [0x44, 0x42, 0x05, 0x08, 0x01, 0x00, 0x00, 0x00, 0x00, 0x03, 0xF0, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x17, 0xC3, 0x70, 0x43, 0xCE];

describe('Madden Table component', () => {
  const wrapper = shallowMount(MaddenTable);

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('vue component unit tests', () => {
    it('component has expected name', () => {
      expect(wrapper.name()).to.eql('MaddenTable');
    });
  });

  describe('has a computed method to calculate tables', () => {

  });
});