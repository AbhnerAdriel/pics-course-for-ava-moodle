import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {unitThree} from '../assets/js/data/units/unidade-3.js';
import {course, unitsBySlug} from '../assets/js/data/course.js';
import * as data from '../assets/js/data/units/unidade-3-interactions.js';
import {evaluateUnitThreeAnswers, evaluateUnitThreeMatches} from '../assets/js/components/unit-three-tools.js';
const fixture=JSON.parse(fs.readFileSync(new URL('./fixtures/unit-three-source-text.json',import.meta.url),'utf8'));
const decode=html=>html.replace(/<[^>]+>/g,'').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const html=unitThree.pages.map(p=>p.html).join('\n');
const text=decode(html);

test('integra as cinco páginas da Unidade 3 na ordem original e na navegação do curso',()=>{
    assert.equal(unitsBySlug.get('unidade-3'),unitThree);
    assert.equal(course.units.find(u=>u.slug==='unidade-3').available,true);
    assert.deepEqual(unitThree.pages.map(p=>p.title),fixture.pages);
});
test('preserva os segmentos do ZIP mantidos após a remoção solicitada da identificação da aula',()=>{
    let position=0;
    const retainedSegments=fixture.textSegments.slice(9).map(segment=>segment==='[Acolhimento e contextualização]' ? 'Acolhimento e contextualização' : segment);
    assert.doesNotMatch(unitThree.pages[0].html,/Unidade 3 - Aula completa|Identificação da aula|Carga horária estimada:|Descrição:/);
    for(const segment of retainedSegments){
        const index=text.indexOf(segment,position);
        assert.ok(index>=0,`Trecho ausente ou fora da sequência: ${segment}`);
        position=index+segment.length;
    }
    for(const segment of retainedSegments.filter(s=>s.length>180)) assert.equal(text.split(segment).length-1,1,segment);
    assert.doesNotMatch(text,/Orientações pedagógicas|DADO DA REFERÊNCIA A CONFERIR|ESPAÇO RESERVADO|PARTE 4 - Pontos/);
});
test('preserva os dados, acentos, figuras e legendas das seis estruturas dinâmicas do ZIP',()=>{
    for(const [name,items] of Object.entries(fixture.dynamicData)) assert.deepEqual(data[name],items,name);
    const strings=Object.values(fixture.dynamicData).flat().flatMap(item=>[item.title,item.text,item.label,item.detail,item.description,item.resourceCaption].filter(Boolean));
    for(const value of strings) assert.ok(text.includes(value),value);
    for(const name of ['sukhasana.png','shavasana.png']){
        const image=fs.readFileSync(new URL(`../assets/images/unidades/unidade-03/${name}`,import.meta.url));
        assert.equal(image.subarray(1,4).toString(),'PNG');
        assert.ok(html.includes(`unidade-03/${name}`));
    }
});
test('mantém exatamente as três questões disponíveis e ambos os feedbacks, sem inventar questões ausentes',()=>{
    assert.deepEqual(data.unitThreeQuestions,fixture.questions);
    assert.equal((html.match(/<fieldset/g)||[]).length,3);
    assert.equal((html.match(/type="radio"/g)||[]).length,15);
    for(const question of fixture.questions){
        for(const value of [question.prompt,...question.options,question.feedback,question.incorrectFeedback,question.objective]) assert.ok(text.includes(value),value);
    }
    assert.deepEqual(evaluateUnitThreeAnswers([1,2,2]),{correct:[true,true,true],score:6,total:6});
    assert.equal(evaluateUnitThreeAnswers([1,2]),null);
    assert.equal(evaluateUnitThreeAnswers([1,2,5]),null);
    assert.equal(evaluateUnitThreeAnswers([0,0,0]).score,0);
});
test('oferece associação acessível com o gabarito original e não duplica identificadores ARIA',()=>{
    assert.equal(evaluateUnitThreeMatches({p1:'t1',p2:'t2',p3:'t3',p4:'t4'}).allCorrect,true);
    assert.equal(evaluateUnitThreeMatches({p1:'t2',p2:'t1',p3:'t3',p4:'t4'}).correctCount,2);
    assert.equal(evaluateUnitThreeMatches({p1:'unknown'}),null);
    assert.equal((html.match(/<button[^>]+data-matching-term=/g)||[]).length,4);
    assert.equal((html.match(/<button[^>]+data-matching-target=/g)||[]).length,4);
    for(const page of unitThree.pages){
        const ids=[...page.html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
        assert.equal(new Set(ids).size,ids.length);
        for(const match of page.html.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g)) for(const id of match[1].split(' ')) assert.ok(ids.includes(id),id);
    }
    assert.equal((unitThree.pages[1].html.match(/<details open>/g)||[]).length,1);
    assert.equal((unitThree.pages[2].html.match(/<details open>/g)||[]).length,1);
});
test('recursos ausentes ficam configuráveis sem links locais quebrados e conservam os rótulos originais',()=>{
    for(const name of fixture.documents) assert.ok(html.includes(`data-unit-three-document="${name}"`),name);
    assert.doesNotMatch(html,/href="\.\/docs\//);
    assert.ok(html.includes('data-config-link="unitThreeForumUrl"'));
    for(const match of html.matchAll(/(?:src|href)="(\.\/assets\/[^"#]+)"/g)) assert.ok(fs.existsSync(new URL(`../${match[1].slice(2)}`,import.meta.url)),match[1]);
});
