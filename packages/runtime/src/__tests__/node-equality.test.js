import {describe,it,expect} from 'vitest';
import {hFragment, hText,h} from "../h";
import {isNodeEquals} from "../node-equality";

describe('isNodeEquals',()=>{
    it("should return true if the both node type is in type of 'TEXT'",()=>{
        const dom1 = hText("test")
        const dom2 = hText("hallo")

        expect(isNodeEquals(dom1,dom2)).to.toBeTruthy()
    })

    it("should return true if the both node type is in type of 'FRAGMENT'",()=>{
        const dom1 = hFragment([
            hText("hallo")
        ])
        const dom2 = hFragment([
            hText("hola")
        ])

        expect(isNodeEquals(dom1,dom2)).to.toBeTruthy()
    })

    it("should return false if both type is different",()=>{
        const dom1 = hText("test")
        const dom2 = hFragment([
            hText("hola")
        ])

        expect(isNodeEquals(dom1,dom2)).not.toBeTruthy()
    })

    it("should return true if nodes of type 'ELEMENT' have the same tag",()=>{
        const dom1 = h('p',null,[
            hText('Paragraph 1')
        ])

        const dom2 = h('p',null,[
            hText('Paragraph 2')
        ])

        expect(isNodeEquals(dom2,dom1)).to.toBeTruthy()
    })

    it("should return false if nodes of type 'ELEMENT' have different tag",()=>{
        const dom1 = h('p',null,[
            hText('Paragraph 1')
        ])

        const dom2 = h('span',null,[
            hText('Paragraph 2')
        ])

        expect(isNodeEquals(dom2,dom1)).not.to.toBeTruthy()
    })
})