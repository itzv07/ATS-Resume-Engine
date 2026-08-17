import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { CandidateProfile, ResumeTemplate } from '../types';

/**
 * Exports the Candidate Profile as an authentic Microsoft Word (.docx) file
 * formatted specifically for ATS parsing rules (single column, standard headings, clear tabs).
 */
export async function downloadResumeAsDocx(
  profile: CandidateProfile,
  template: ResumeTemplate,
  filename: string = 'ATS_Optimized_Resume.docx'
) {
  try {
    const docChildren: Paragraph[] = [];

    // 1. Candidate Full Name
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: profile.personal.fullName || 'Candidate Name',
            bold: true,
            size: 30, // 15pt
            font: template.fontFamily?.includes('serif') ? 'Times New Roman' : 'Calibri',
            color: '111111'
          })
        ]
      })
    );

    // 2. Contact Information Line
    const contactParts = [
      profile.personal.email,
      profile.personal.mobileNumber,
      profile.personal.location,
      profile.personal.linkedIn,
      profile.personal.gitHub,
      profile.personal.portfolio
    ].filter(Boolean);

    if (contactParts.length > 0) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: contactParts.join('  |  '),
              size: 18, // 9pt
              font: 'Calibri',
              color: '444444'
            })
          ]
        })
      );
    }

    // Helper to generate ATS Section Headings
    const addSectionHeading = (title: string) => {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 80 },
          border: {
            bottom: {
              color: '111111',
              space: 2,
              style: BorderStyle.SINGLE,
              size: 6
            }
          },
          children: [
            new TextRun({
              text: title.toUpperCase(),
              bold: true,
              size: 21, // 10.5pt
              font: 'Calibri',
              color: '111111'
            })
          ]
        })
      );
    };

    // 3. Professional Summary
    if (profile.personal.summary) {
      addSectionHeading('Professional Summary');
      docChildren.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: profile.personal.summary,
              size: 20, // 10pt
              font: 'Calibri'
            })
          ]
        })
      );
    }

    // 4. Technical Skills
    if (profile.skills && profile.skills.length > 0) {
      addSectionHeading('Technical Skills');
      profile.skills.forEach(cat => {
        if (cat.skills && cat.skills.length > 0) {
          docChildren.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: `${cat.categoryName}: `,
                  bold: true,
                  size: 20,
                  font: 'Calibri'
                }),
                new TextRun({
                  text: cat.skills.join(', '),
                  size: 20,
                  font: 'Calibri'
                })
              ]
            })
          );
        }
      });
    }

    // 5. Work Experience
    if (profile.experience && profile.experience.length > 0) {
      addSectionHeading('Work Experience');
      profile.experience.forEach(exp => {
        docChildren.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({
                text: exp.jobTitle,
                bold: true,
                size: 20,
                font: 'Calibri'
              }),
              new TextRun({
                text: ` — ${exp.company}`,
                size: 20,
                font: 'Calibri'
              }),
              new TextRun({
                text: `\t${exp.employmentDates}`,
                size: 18,
                font: 'Calibri',
                color: '555555'
              })
            ]
          })
        );

        if (exp.responsibilities && exp.responsibilities.length > 0) {
          exp.responsibilities.forEach(bullet => {
            docChildren.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 30 },
                children: [
                  new TextRun({
                    text: bullet,
                    size: 19,
                    font: 'Calibri'
                  })
                ]
              })
            );
          });
        }
      });
    }

    // 6. Internships
    if (profile.internships && profile.internships.length > 0) {
      addSectionHeading('Internships & Training');
      profile.internships.forEach(intern => {
        docChildren.push(
          new Paragraph({
            spacing: { before: 90, after: 30 },
            children: [
              new TextRun({
                text: intern.role,
                bold: true,
                size: 20,
                font: 'Calibri'
              }),
              new TextRun({
                text: ` — ${intern.organization}`,
                size: 20,
                font: 'Calibri'
              }),
              new TextRun({
                text: `\t${intern.duration}`,
                size: 18,
                font: 'Calibri',
                color: '555555'
              })
            ]
          })
        );

        if (intern.responsibilities && intern.responsibilities.length > 0) {
          intern.responsibilities.forEach(bullet => {
            docChildren.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 30 },
                children: [
                  new TextRun({
                    text: bullet,
                    size: 19,
                    font: 'Calibri'
                  })
                ]
              })
            );
          });
        }
      });
    }

    // 7. Key Projects
    if (profile.projects && profile.projects.length > 0) {
      addSectionHeading('Key Projects');
      profile.projects.forEach(proj => {
        docChildren.push(
          new Paragraph({
            spacing: { before: 90, after: 30 },
            children: [
              new TextRun({
                text: proj.projectName,
                bold: true,
                size: 20,
                font: 'Calibri'
              }),
              new TextRun({
                text: proj.technologies ? ` (${proj.technologies})` : '',
                italics: true,
                size: 18,
                font: 'Calibri',
                color: '444444'
              })
            ]
          })
        );

        if (proj.description) {
          docChildren.push(
            new Paragraph({
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: proj.description,
                  size: 19,
                  font: 'Calibri'
                })
              ]
            })
          );
        }

        if (proj.responsibilities && proj.responsibilities.length > 0) {
          proj.responsibilities.forEach(bullet => {
            docChildren.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 30 },
                children: [
                  new TextRun({
                    text: bullet,
                    size: 19,
                    font: 'Calibri'
                  })
                ]
              })
            );
          });
        }
      });
    }

    // 8. Education
    if (profile.education && profile.education.length > 0) {
      addSectionHeading('Education');
      profile.education.forEach(edu => {
        docChildren.push(
          new Paragraph({
            spacing: { before: 70, after: 30 },
            children: [
              new TextRun({
                text: edu.degree,
                bold: true,
                size: 20,
                font: 'Calibri'
              }),
              new TextRun({
                text: ` — ${edu.institution}`,
                size: 20,
                font: 'Calibri'
              }),
              new TextRun({
                text: `\t${edu.graduationYear}`,
                size: 18,
                font: 'Calibri',
                color: '555555'
              })
            ]
          })
        );
        if (edu.cgpaOrPercentage) {
          docChildren.push(
            new Paragraph({
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: `Grade/CGPA: ${edu.cgpaOrPercentage}`,
                  size: 18,
                  font: 'Calibri'
                })
              ]
            })
          );
        }
      });
    }

    // 9. Certifications
    if (profile.certifications && profile.certifications.length > 0) {
      addSectionHeading('Certifications');
      profile.certifications.forEach(cert => {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 30 },
            children: [
              new TextRun({
                text: cert.certificationName,
                bold: true,
                size: 19,
                font: 'Calibri'
              }),
              new TextRun({
                text: ` — ${cert.issuingOrganization} (${cert.issueDate})`,
                size: 19,
                font: 'Calibri'
              })
            ]
          })
        );
      });
    }

    // 10. Achievements
    if (profile.achievements && profile.achievements.length > 0) {
      addSectionHeading('Achievements & Honors');
      profile.achievements.forEach(ach => {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 30 },
            children: [
              new TextRun({
                text: `${ach.title}: `,
                bold: true,
                size: 19,
                font: 'Calibri'
              }),
              new TextRun({
                text: ach.description,
                size: 19,
                font: 'Calibri'
              })
            ]
          })
        );
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 0.5 in
                bottom: 720,
                left: 720,
                right: 720
              }
            }
          },
          children: docChildren
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('DOCX export error:', err);
    alert('Failed to generate DOCX file.');
  }
}

