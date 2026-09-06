const { Groq } = require("groq-sdk");
const { z } = require("zod");
const {zodToJsonSchema} = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const interviewReportSchema = z.object({
    matchScore: z.coerce.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated").default("Interview Report"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const jsonSchema = JSON.stringify(zodToJsonSchema(interviewReportSchema), null, 2);

//     const prompt = `Generate an interview report for a candidate with the following details:
//                         Resume: ${resume}
//                         Self Description: ${selfDescription}
//                         Job Description: ${jobDescription}
//                         Include the following details along with the report:
//                         1. matchScore: A score between 0 and 100 indicating how well the candidate's profile matches the job describe
//                         2. technicalQuestions: Technical questions that can be asked in the interview along with their intention and how to answer them
//                         3. behavioralQuestions: Behavioral questions that can be asked in the interview along with their intention and how to answer them
//                         4. skillGaps: List of skill gaps in the candidate's profile along with their severity
//                         5. preparationPlan: A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively
// `

    const response = await ai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: `You are a recruitment expert.

                            Return ONLY valid JSON like this example:

                            {
                            "matchScore": 85,
                            "technicalQuestions":[
                            {
                            "question":"Explain REST API",
                            "intention":"Check backend knowledge",
                            "answer":"Explain REST principles..."
                            }
                            ],
                            "behavioralQuestions":[
                            {
                            "question":"Tell me about a challenge",
                            "intention":"Check problem solving",
                            "answer":"Use STAR method"
                            }
                            ],
                            "skillGaps":[
                            {
                            "skill":"System Design",
                            "severity":"high"
                            }
                            ],
                            "preparationPlan":[
                            {
                            "day":1,
                            "focus":"Data Structures",
                            "tasks":["Solve 5 Leetcode problems"]
                            }
                            ],
                            "title":"Interview Report"
                            }

                            Return ONLY JSON. No text.`
            },
            {
                role: "user",
                content: `Generate the report based on these details:
                Resume: ${resume}
                Self Description: ${selfDescription}
                Job Description: ${jobDescription}`
            }
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.5,
        response_format: { type: "json_object" }
        // config: {
        //     responseMimeType: "application/json",
        //     responseSchema: zodToJsonSchema(interviewReportSchema),
        // }
    })
    const text = response.choices[0].message.content;
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}") + 1
    const json = JSON.parse(text.slice(start, end))

    const res = interviewReportSchema.parse(json)
        return res;

}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
            {
                role: "system",
                content: `You are a recruitment expert.

                        Return ONLY valid JSON like this example:

                        {
                        "matchScore": 85,
                        "technicalQuestions":[
                        {
                        "question":"Explain REST API",
                        "intention":"Check backend knowledge",
                        "answer":"Explain REST principles..."
                        }
                        ],
                        "behavioralQuestions":[
                        {
                        "question":"Tell me about a challenge",
                        "intention":"Check problem solving",
                        "answer":"Use STAR method"
                        }
                        ],
                        "skillGaps":[
                        {
                        "skill":"System Design",
                        "severity":"high"
                        }
                        ],
                        "preparationPlan":[
                        {
                        "day":1,
                        "focus":"Data Structures",
                        "tasks":["Solve 5 Leetcode problems"]
                        }
                        ],
                        "title":"Interview Report"
                        }

                        Return ONLY JSON. No text.`
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.5,
        response_format: { type: "json_object" }
        // config: {
        //     responseMimeType: "application/json",
        //     responseSchema: zodToJsonSchema(resumePdfSchema),
        // }
    })
    const text = response.choices[0].message.content

    // safer JSON extraction
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}") + 1
    const json = JSON.parse(text.slice(start, end))

    const jsonContent = resumePdfSchema.parse(json)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }